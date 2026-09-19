from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'brand', 'unit', 'category', 'price', 'is_deal', 'vendor')
    list_filter = ('category', 'is_deal', 'availability')
    search_fields = ('title', 'brand')
