from rest_framework import serializers

from orders.models import OrderItem
from products.models import Product


class VendorProductSerializer(serializers.ModelSerializer):
    """The vendor list renames the picture column to image_url with an
    underscore, while the shop screens keep imageUrl. Same column, two names —
    that is the lesson: a serializer can rename a field on the way out."""

    image_url = serializers.CharField(source='imageUrl', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'title',
            'brand',
            'unit',
            'category',
            'rating',
            'price',
            'availability',
            'image_url',
        )


class VendorOrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    # Worked out on the server, so a row can never be nudged backwards.
    next_status = serializers.CharField(read_only=True, allow_null=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    buyer = serializers.CharField(source='order.user.username', read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'order_id',
            'buyer',
            'product',
            'title',
            'brand',
            'unit',
            'image_url',
            'price',
            'quantity',
            'subtotal',
            'status',
            'next_status',
        )


class UpdateOrderItemStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['placed', 'shipped', 'delivered', 'cancelled'])
