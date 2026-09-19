from rest_framework import serializers

from products.models import Product

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """Every row carries two ids. `id` is the row, `product` is the product.
    PATCH and DELETE want the row id, POST /api/cart/add/ wants the product
    id."""

    product_title = serializers.CharField(source='product.title', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    # Money arrives as text on purpose, so nothing quietly rounds it.
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True
    )
    product_image_url = serializers.CharField(source='product.imageUrl', read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = (
            'id',
            'product',
            'product_title',
            'product_brand',
            'product_unit',
            'product_price',
            'product_image_url',
            'quantity',
            'subtotal',
        )


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Cart
        fields = ('id', 'user', 'created_at', 'items', 'total_items', 'total_price')


class AddToCartSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.ModelSerializer):
    """PATCH sets the quantity. It does not add to it."""

    quantity = serializers.IntegerField(min_value=1)

    class Meta:
        model = CartItem
        fields = ('quantity',)
