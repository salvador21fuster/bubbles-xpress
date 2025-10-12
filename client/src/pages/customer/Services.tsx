import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingBag, User, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

// Import product images
import dressImage from "@assets/stock_images/professional_clean_e_f68eb49b.jpg";
import suit2Image from "@assets/stock_images/professional_two_pie_d822de07.jpg";
import suit3Image from "@assets/stock_images/professional_three_p_dfa1ec2d.jpg";
import waistcoatImage from "@assets/stock_images/professional_waistco_45fbdce0.jpg";
import blouseImage from "@assets/stock_images/professional_elegant_7cbbe4bb.jpg";
import tshirtImage from "@assets/stock_images/clean_folded_t-shirt_4d3c0cb8.jpg";
import shirtImage from "@assets/stock_images/professional_dress_s_79729137.jpg";
import jumperImage from "@assets/stock_images/professional_cardiga_387eb55d.jpg";
import tieImage from "@assets/stock_images/professional_necktie_ee2802d3.jpg";
import trousersImage from "@assets/stock_images/professional_dress_t_d7e9ab5f.jpg";
import skirtImage from "@assets/stock_images/professional_skirt_o_268165ca.jpg";
import shortsImage from "@assets/stock_images/professional_shorts__ad7c5147.jpg";
import jacketImage from "@assets/stock_images/professional_blazer__2143af7e.jpg";
import coatImage from "@assets/stock_images/professional_winter__163dbcf9.jpg";
import pjs1Image from "@assets/stock_images/folded_pajamas_sleep_dfeb6e55.jpg";
import pjs2Image from "@assets/stock_images/folded_two_piece_paj_d2dd57f4.jpg";

interface Product {
  code: string;
  name: string;
  price: number;
  image: string;
  category: 'wash_dry_fold' | 'dry_cleaning';
}

const products: Product[] = [
  { code: 'WDF', name: 'Wash/Dry/Fold', price: 3.50, image: tshirtImage, category: 'wash_dry_fold' },
  { code: 'DRESS', name: 'Dress', price: 19.60, image: dressImage, category: 'dry_cleaning' },
  { code: 'SUIT2', name: '2-Piece Suit', price: 15.40, image: suit2Image, category: 'dry_cleaning' },
  { code: 'SUIT3', name: '3-Piece Suit', price: 22.40, image: suit3Image, category: 'dry_cleaning' },
  { code: 'WAIST', name: 'Waistcoat', price: 5.60, image: waistcoatImage, category: 'dry_cleaning' },
  { code: 'BLOUSE', name: 'Blouse', price: 8.40, image: blouseImage, category: 'dry_cleaning' },
  { code: 'TSHIRT', name: 'T-Shirt', price: 1.75, image: tshirtImage, category: 'dry_cleaning' },
  { code: 'SHIRT', name: 'Shirt', price: 2.80, image: shirtImage, category: 'dry_cleaning' },
  { code: 'JUMPER', name: 'Jumper/Cardigan', price: 8.40, image: jumperImage, category: 'dry_cleaning' },
  { code: 'TIE', name: 'Tie', price: 7.00, image: tieImage, category: 'dry_cleaning' },
  { code: 'TROUS', name: 'Trousers', price: 8.40, image: trousersImage, category: 'dry_cleaning' },
  { code: 'SKIRT', name: 'Skirt', price: 8.40, image: skirtImage, category: 'dry_cleaning' },
  { code: 'SHORTS', name: 'Shorts', price: 5.60, image: shortsImage, category: 'dry_cleaning' },
  { code: 'JACKET', name: 'Jacket', price: 9.80, image: jacketImage, category: 'dry_cleaning' },
  { code: 'COAT', name: 'Coat', price: 19.60, image: coatImage, category: 'dry_cleaning' },
  { code: 'PJS1', name: 'Pyjamas (1 Piece)', price: 4.20, image: pjs1Image, category: 'dry_cleaning' },
  { code: 'PJS2', name: 'Pyjamas (2 Piece)', price: 8.40, image: pjs2Image, category: 'dry_cleaning' },
];

export default function CustomerServices() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { cart, addToCart: addToCartContext, removeFromCart: removeFromCartContext, getCartCount, getCartTotal } = useCart();
  const [activeCategory, setActiveCategory] = useState<'all' | 'wash_dry_fold' | 'dry_cleaning'>('all');

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
  });

  const handleAddToCart = (product: Product) => {
    addToCartContext({
      productCode: product.code,
      productName: product.name,
      quantity: 1,
      unitPrice: Math.round(product.price * 100), // Convert euros to cents
    });
  };

  const handleRemoveFromCart = (productCode: string) => {
    removeFromCartContext(productCode);
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header - Uber Eats Style */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Mr Bubbles Express</h1>
            <p className="text-sm text-gray-600">Laundry & Dry Cleaning</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="rounded-full"
            data-testid="category-all"
          >
            All Services
          </Button>
          <Button
            variant={activeCategory === 'wash_dry_fold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('wash_dry_fold')}
            className="rounded-full"
            data-testid="category-wash-dry-fold"
          >
            Wash/Dry/Fold
          </Button>
          <Button
            variant={activeCategory === 'dry_cleaning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('dry_cleaning')}
            className="rounded-full"
            data-testid="category-dry-cleaning"
          >
            Dry Cleaning
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => {
            const cartItem = cart[product.code];
            const quantity = cartItem?.quantity || 0;
            return (
              <Card 
                key={product.code} 
                className="flex gap-4 p-3 rounded-lg border border-gray-200"
                data-testid={`product-card-${product.code}`}
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{product.name}</h3>
                    {product.code === 'WDF' && (
                      <p className="text-xs text-gray-600">€{product.price}/kg</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">
                      €{product.price.toFixed(2)}
                      {product.code !== 'WDF' && <span className="text-gray-600">/item</span>}
                    </p>
                    {quantity > 0 ? (
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleRemoveFromCart(product.code)}
                          data-testid={`button-decrease-${product.code}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-6 text-center" data-testid={`quantity-${product.code}`}>
                          {quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="default"
                          className="h-8 w-8 rounded-full bg-primary"
                          onClick={() => handleAddToCart(product)}
                          data-testid={`button-increase-${product.code}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleAddToCart(product)}
                        data-testid={`button-add-${product.code}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Cart Bar - Uber Eats Style */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <Link href="/customer/checkout">
            <Button 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg flex items-center justify-between px-6"
              data-testid="button-view-cart"
            >
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full px-2 py-1">
                  <span className="text-sm font-bold">{getCartCount()}</span>
                </div>
                <span>View cart</span>
              </div>
              <span>€{(getCartTotal() / 100).toFixed(2)}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
