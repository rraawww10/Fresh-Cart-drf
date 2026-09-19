from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import (
    AddToCartSerializer,
    CartItemSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """GET /api/cart/ — the whole cart, rows inside `items`. No cart for a
    visitor: without a token this answers 401."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_or_create_cart(request.user)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        return Response(
            CartItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )


class CartItemDetailView(generics.GenericAPIView):
    """PATCH sets a row's quantity, DELETE takes the row out (204, no body)."""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only ever your own rows.
        return CartItem.objects.filter(cart__user=self.request.user)

    def patch(self, request, pk):
        item = generics.get_object_or_404(self.get_queryset(), pk=pk)
        serializer = UpdateCartItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        item = generics.get_object_or_404(self.get_queryset(), pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
