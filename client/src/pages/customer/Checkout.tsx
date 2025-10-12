import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, MapPin, Calendar, CreditCard, Percent } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";

export default function CustomerCheckout() {
  const { getCartItems, getCartTotal } = useCart();
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'scheduled'>('standard');
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  const cartItems = getCartItems();
  const subtotalCents = getCartTotal(); // Total in cents
  const deliveryFeeCents = 450; // €4.50 in cents
  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const vatCents = Math.round((subtotalCents + deliveryFeeCents + tipCents) * 0.23); // 23% VAT
  const totalCents = subtotalCents + deliveryFeeCents + tipCents + vatCents;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link href="/customer">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Delivery Address */}
        <Card className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Delivery address</h3>
              <p className="text-sm text-gray-600">5 Greenhills villa'S</p>
              <p className="text-sm text-gray-600">Yellowbatter, Drogheda, Co. Louth</p>
              <Button variant="ghost" className="p-0 h-auto text-primary" data-testid="button-edit-address">
                Add delivery instructions
              </Button>
            </div>
          </div>
        </Card>

        {/* Delivery Options */}
        <div>
          <h2 className="font-bold text-lg mb-3">Delivery options</h2>
          <div className="space-y-2">
            <button
              onClick={() => setDeliveryOption('standard')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                deliveryOption === 'standard' 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200'
              }`}
              data-testid="option-standard"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                  {deliveryOption === 'standard' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Standard</p>
                  <p className="text-sm text-gray-600">24-48 hours</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setDeliveryOption('scheduled')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                deliveryOption === 'scheduled' 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-200'
              }`}
              data-testid="option-scheduled"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                  {deliveryOption === 'scheduled' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Schedule</p>
                  <p className="text-sm text-gray-600">Choose your preferred time</p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-3">Mr Bubbles Express</h3>
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                <span>€{((item.unitPrice * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment */}
        <Card className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Card Payment</p>
                <p className="text-sm text-gray-600">Apple Pay</p>
              </div>
            </div>
            <ChevronLeft className="h-5 w-5 rotate-180 text-gray-400" />
          </div>
        </Card>

        {/* Add a Tip */}
        <div>
          <h2 className="font-bold text-lg mb-1">Add a tip</h2>
          <p className="text-sm text-gray-600 mb-3">
            Tipping is an optional way to thank the person who delivers your order
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[0, 10, 15, 20, 25].map((percentage) => (
              <button
                key={percentage}
                onClick={() => setTipPercentage(percentage)}
                className={`px-4 py-2 rounded-full border whitespace-nowrap transition-colors ${
                  tipPercentage === percentage
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300'
                }`}
                data-testid={`tip-${percentage}`}
              >
                {percentage === 0 ? 'Not now' : `${percentage}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>€{(subtotalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery fee</span>
            <span>€{(deliveryFeeCents / 100).toFixed(2)}</span>
          </div>
          {tipPercentage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip ({tipPercentage}%)</span>
              <span>€{(tipCents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">VAT (23%)</span>
            <span>€{(vatCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span>€{(totalCents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <Button 
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg"
          data-testid="button-place-order"
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
