from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """The shop shape. Note imageUrl stays camelCase while is_deal and
    total_reviews stay snake_case — that mix is deliberate."""

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'brand',
            'unit',
            'category',
            'price',
            'mrp',
            'imageUrl',
            'rating',
            'total_reviews',
            'description',
            'availability',
            'is_deal',
        )
        # The owner never arrives from the browser. The view takes it from the
        # token, otherwise anybody could list a product in somebody else's name.
        read_only_fields = ('id', 'rating', 'total_reviews')
