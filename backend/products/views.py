from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter

from .filters import ProductFilter
from .models import Product
from .pagination import ProductsPagination
from .serializers import ProductSerializer

# django-filter accepts more than one spelling of true, so this is a set of the
# spellings rather than a comparison against one word.
DEAL_VALUES = {'true', 'True', '1'}


def visible_products(user):
    """The members-only rule, written down once.

    A logged-in person gets every product. A visitor gets the products that are
    not Deals of the Day. Note this is a function called per request, not a
    class attribute: a `queryset =` line is worked out once when Django starts
    and can never know who is asking.
    """
    queryset = Product.objects.all()
    if user and user.is_authenticated:
        return queryset
    return queryset.filter(is_deal=False)


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    pagination_class = ProductsPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    # One name, two columns.
    search_fields = ['title', 'brand']
    ordering_fields = ['price', 'rating', 'title', 'id']
    ordering = ['id']

    def get_queryset(self):
        return visible_products(self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        # Asking for the Deals of the Day directly needs a token. Without one
        # this is a 401, not an empty list.
        if self.request.query_params.get('is_deal') in DEAL_VALUES:
            return [permissions.IsAuthenticated()]
        # Anything else falls through, so the public list stays public.
        return super().get_permissions()

    def perform_create(self, serializer):
        # The owner comes from the token, never from the request body.
        serializer.save(vendor=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return visible_products(self.request.user)

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return super().get_permissions()
        return [permissions.IsAuthenticated()]

    def _check_owner(self, product):
        if product.vendor_id != self.request.user.id:
            raise PermissionDenied('You can only change products you own.')

    def perform_update(self, serializer):
        self._check_owner(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_owner(instance)
        instance.delete()
