from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, DecimalField, F, Sum
from django.db.models.functions import Coalesce, TruncDate
from django.utils import timezone
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import NEXT_STATUS, OrderItem
from products.models import Product
from products.pagination import ProductsPagination

from .serializers import (
    UpdateOrderItemStatusSerializer,
    VendorOrderItemSerializer,
    VendorProductSerializer,
)

# price * quantity, as a decimal the database can add up.
LINE_TOTAL = F('price') * F('quantity')
MONEY = DecimalField(max_digits=14, decimal_places=2)


def money(value):
    """Money leaves as text, the same as everywhere else in this project."""
    return f'{Decimal(value or 0):.2f}'


class VendorProductListView(generics.ListAPIView):
    """GET /api/vendor/products/ — only your own products.

    Which products come back is decided from the token, never from a query name
    the browser could change.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = VendorProductSerializer
    pagination_class = ProductsPagination
    filter_backends = [SearchFilter]
    search_fields = ['title', 'brand']

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user).order_by('-id')


class VendorOrderItemListView(generics.ListAPIView):
    """GET /api/vendor/orders/ — only the rows that belong to the caller.

    An order can hold two vendors' products, and a vendor never sees what the
    same customer bought from somebody else.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = VendorOrderItemSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            OrderItem.objects
            .filter(vendor=self.request.user)
            .select_related('order', 'order__user')
            .order_by('-order__placed_at', '-id')
        )


class VendorOrderItemUpdateView(APIView):
    """PATCH /api/vendor/orders/items/<id>/ — moves one of your rows forward."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        item = generics.get_object_or_404(
            OrderItem.objects.select_related('order'), pk=pk, vendor=request.user
        )

        serializer = UpdateOrderItemStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wanted = serializer.validated_data['status']

        # A row never goes backwards, and it only ever takes the one step the
        # server itself worked out.
        if NEXT_STATUS.get(item.status) != wanted:
            return Response(
                {'detail': f'A {item.status} item cannot become {wanted}.'},
                status=400,
            )

        item.status = wanted
        item.save(update_fields=['status'])

        # The order re-reads all of its items, so the customer's badge can never
        # disagree with the rows behind it.
        item.order.sync_status_from_items()

        return Response(VendorOrderItemSerializer(item).data)


class VendorSummaryView(APIView):
    """GET /api/vendor/summary/ — one request fills the whole dashboard.

    React adds nothing up. Every number arrives finished.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        rows = OrderItem.objects.filter(vendor=user)
        # Revenue never counts a cancelled row.
        earning_rows = rows.exclude(status='cancelled')

        revenue = earning_rows.aggregate(
            total=Coalesce(Sum(LINE_TOTAL, output_field=MONEY), Decimal('0.00'))
        )['total']

        units_sold = rows.aggregate(total=Coalesce(Sum('quantity'), 0))['total']
        order_count = rows.values('order_id').distinct().count()
        product_count = Product.objects.filter(vendor=user).count()
        awaiting_shipment = rows.filter(status='placed').count()

        # by_status always carries all four words, even the ones sitting at zero.
        by_status = {'placed': 0, 'shipped': 0, 'delivered': 0, 'cancelled': 0}
        for row in rows.values('status').annotate(n=Count('id')):
            by_status[row['status']] = row['n']

        # Seven entries, always. Empty days included, or the chart has gaps.
        today = timezone.localdate()
        start = today - timedelta(days=6)
        per_day = {
            row['day']: row['amount']
            for row in (
                earning_rows
                .annotate(day=TruncDate('order__placed_at'))
                .filter(day__gte=start, day__lte=today)
                .values('day')
                .annotate(amount=Coalesce(Sum(LINE_TOTAL, output_field=MONEY), Decimal('0.00')))
            )
        }
        last_7_days = [
            {
                'date': (start + timedelta(days=offset)).isoformat(),
                'revenue': money(per_day.get(start + timedelta(days=offset), 0)),
            }
            for offset in range(7)
        ]

        top_products = [
            {
                'product': row['product'],
                'title': row['title'],
                'units': row['units'],
                'revenue': money(row['amount']),
            }
            for row in (
                earning_rows
                .values('product', 'title')
                .annotate(
                    units=Sum('quantity'),
                    amount=Coalesce(Sum(LINE_TOTAL, output_field=MONEY), Decimal('0.00')),
                )
                .order_by('-units')[:5]
            )
        ]

        return Response({
            'revenue': money(revenue),
            'orders': order_count,
            'units_sold': units_sold,
            'products': product_count,
            'awaiting_shipment': awaiting_shipment,
            'last_7_days': last_7_days,
            'by_status': by_status,
            'top_products': top_products,
        })
