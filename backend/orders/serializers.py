from rest_framework import serializers

from .models import Address, Order, OrderItem


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('full_name', 'phone', 'address', 'city', 'state', 'pincode')


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    next_status = serializers.CharField(read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            'id',
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


class OrderListSerializer(serializers.ModelSerializer):
    """One card per order on My Orders."""

    item_count = serializers.IntegerField(read_only=True)
    thumbnail = serializers.CharField(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'placed_at',
            'status',
            'total',
            'item_count',
            'payment_method',
            'delivery_slot',
            'is_paid',
            'thumbnail',
        )


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'placed_at',
            'status',
            'payment_method',
            'delivery_slot',
            'is_paid',
            'total',
            'shipping',
            'can_cancel',
            'item_count',
            'address',
            'items',
        )


class CreateOrderSerializer(serializers.Serializer):
    """Only three things arrive from the browser. The cart and the total already
    live on the server, and a total sent by the browser can be edited by it."""

    payment_method = serializers.ChoiceField(choices=['COD', 'CARD'], default='COD')
    delivery_slot = serializers.ChoiceField(
        choices=['MORNING', 'AFTERNOON', 'EVENING'], default='MORNING'
    )
    address = AddressSerializer()
