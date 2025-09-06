import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Heart, Award, Sparkles } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "../components/SEOHead";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const DonationForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/donate?success=true",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          paymentMethodOrder: ['card'],
          wallets: {
            applePay: 'never',
            googlePay: 'never'
          }
        }}
      />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="mr-2 h-4 w-4" />
            Complete Donation
          </>
        )}
      </Button>
    </form>
  );
};

export default function Donate() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for success parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';

  const predefinedAmounts = [10, 50, 100, 500];

  const createPaymentIntent = async (amount: number) => {
    setIsLoading(true);
    try {
      const data = await apiRequest("POST", "/api/create-payment-intent", { amount });
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
    createPaymentIntent(amount);
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= 1) {
      setSelectedAmount(amount);
      setIsCustom(true);
      createPaymentIntent(amount);
    }
  };

  useEffect(() => {
    // Create PaymentIntent with default amount when page loads
    if (!isSuccess) {
      createPaymentIntent(selectedAmount);
    }
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <SEOHead 
          title="Thank You - Donation Successful | Belle Journal"
          description="Thank you for supporting Belle Journal and Rheonda's work!"
          keywords={["donation", "support", "thank you", "Belle Journal"]}
        />
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">✨</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Belle Journal
              </h1>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
          <Card className="max-w-md mx-auto bg-white/60 dark:bg-[#17111d]/60 backdrop-blur-sm shadow-xl border border-purple-200/50 dark:border-purple-800/50">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your donation has been processed successfully. Your support means the world to me and helps keep Belle Journal growing and improving.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/about">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Back to About
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Award className="mr-2 h-4 w-4" />
                      Explore Belle Journal
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="Support My Work - Donate | Belle Journal"
        description="Support Rheonda and the development of Belle Journal. Your donation helps keep this project growing and improving."
        keywords={["donation", "support", "Belle Journal", "Rheonda Ogletree"]}
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/about">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to About
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">✨</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Belle Journal
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/60 dark:bg-[#17111d]/60 backdrop-blur-sm shadow-xl border border-purple-200/50 dark:border-purple-800/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Support My Work
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Your support helps me continue building and improving Belle Journal. Every donation, no matter the size, makes a difference!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose an amount:</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !isCustom ? "default" : "outline"}
                      onClick={() => handleAmountChange(amount)}
                      className={selectedAmount === amount && !isCustom 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                        : "border-purple-200 text-purple-600 hover:bg-purple-50"
                      }
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                
                {/* Custom Amount */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button 
                    onClick={handleCustomAmountSubmit}
                    disabled={!customAmount || parseFloat(customAmount) < 1}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Set
                  </Button>
                </div>
              </div>

              {/* Payment Form */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Setting up payment...</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <DonationForm />
                </Elements>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-300">Please select an amount to continue.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}