from decimal import Decimal

from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart

from .models import Address, Order, OrderItem
from .serializers import (
    CreateOrderSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
)


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # A customer only ever sees their own orders.
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderListSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = Cart.objects.filter(user=request.user).first()
        items = list(cart.items.select_related('product')) if cart else []
        if not items:
            return Response(
                {'detail': 'Your cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = serializer.validated_data['payment_method']
        order = Order.objects.create(
            user=request.user,
            payment_method=payment_method,
            delivery_slot=serializer.validated_data['delivery_slot'],
            # CARD is paid straight away, COD is paid on delivery.
            is_paid=payment_method == 'CARD',
            shipping=Decimal('0.00'),
            total=Decimal('0.00'),
        )

        total = Decimal('0.00')
        for item in items:
            product = item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                vendor=product.vendor,
                title=product.title,
                brand=product.brand,
                unit=product.unit,
                image_url=product.imageUrl,
                price=product.price,
                quantity=item.quantity,
            )
            total += product.price * item.quantity

        order.total = total
        order.save(update_fields=['total'])

        Address.objects.create(order=order, **serializer.validated_data['address'])

        # Empty the cart so the same products cannot be bought twice. Either all
        # of this saves or none of it does — that is what @transaction.atomic
        # buys.
        cart.items.all().delete()

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        # Somebody else's order id answers 404, never their order.
        return Order.objects.filter(user=self.request.user)


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = generics.get_object_or_404(Order, pk=pk, user=request.user)

        # can_cancel in the answer and this check are the same rule. The hidden
        # button in React is a courtesy; this line is the lock.
        if not order.can_cancel:
            return Response(
                {'detail': 'This order can no longer be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.items.update(status='cancelled')
        order.status = 'cancelled'
        order.save(update_fields=['status'])

        return Response(OrderDetailSerializer(order).data)
