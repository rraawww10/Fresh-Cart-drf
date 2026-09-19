import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Only these names are understood. Anything else — nonsense=xyz — is
    quietly ignored and all the products come back, which is the point of the
    lesson: a wrong name fails without an error."""

    category = django_filters.CharFilter(field_name='category', lookup_expr='exact')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='exact')
    # "4 & up" on the button, so "greater than or equal" in the lookup.
    rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    is_deal = django_filters.BooleanFilter(field_name='is_deal')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'rating', 'is_deal']
