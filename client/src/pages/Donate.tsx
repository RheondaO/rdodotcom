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

// Initialize Stripe outside component
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.protocol}//${window.location.host}/donate?success=true`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const getPaymentElementOptions = () => {
    // Base configuration that explicitly blocks unwanted payment methods
    const baseOptions = {
      wallets: {
        applePay: 'auto' as const,
        googlePay: 'never' as const
      },
      // Explicitly disable unwanted payment methods
      paymentMethodCreation: 'manual' as const,
      layout: {
        type: 'tabs' as const,
        defaultCollapsed: false
      }
    };

    // For $10 - show Google Pay to test control
    if (amount === 10) {
      return {
        ...baseOptions,
        paymentMethodTypes: ['card', 'google_pay', 'apple_pay', 'cashapp'],
        wallets: {
          applePay: 'auto' as const,
          googlePay: 'auto' as const
        }
      };
    }
    
    // For all other amounts - strict allowlist only
    return {
      ...baseOptions,
      paymentMethodTypes: ['card', 'apple_pay', 'cashapp']
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={getPaymentElementOptions()} />
      <Button 
        type="submit" 
        disabled={!stripe || isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Heart className="mr-2 h-4 w-4" />
            Complete Donation - ${amount}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Donate() {
  const [clientSecret, setClientSecret] = useState("");
  const [donationAmount, setDonationAmount] = useState(10);
  const [customInput, setCustomInput] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Check for success parameter
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get('success') === 'true';

  const amounts = [10, 50, 100, 500];

  const createNewPayment = async (amount: number) => {
    setIsCreatingPayment(true);
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { amount });
      setClientSecret(response.clientSecret);
    } catch (error) {
      console.error('Payment creation error:', error);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const selectAmount = (amount: number) => {
    setDonationAmount(amount);
    setIsCustomAmount(false);
    setCustomInput("");
    setClientSecret(""); // Clear current payment
    createNewPayment(amount);
  };

  const applyCustomAmount = () => {
    const amount = parseFloat(customInput);
    if (amount && amount >= 1) {
      setDonationAmount(amount);
      setIsCustomAmount(true);
      setClientSecret(""); // Clear current payment
      createNewPayment(amount);
    }
  };

  // Initialize with default amount
  useEffect(() => {
    if (!isSuccess) {
      createNewPayment(donationAmount);
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
                Your support helps me continue building and improving Belle Journal. Every donation makes a difference!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose an amount:</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {amounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={donationAmount === amount && !isCustomAmount ? "default" : "outline"}
                      onClick={() => selectAmount(amount)}
                      className={donationAmount === amount && !isCustomAmount 
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
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-purple-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button 
                    onClick={applyCustomAmount}
                    disabled={!customInput || parseFloat(customInput) < 1}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Set
                  </Button>
                </div>
              </div>

              {/* Payment Form */}
              {isCreatingPayment ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Setting up payment...</p>
                </div>
              ) : clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#9333ea',
                      },
                      rules: {
                        // Hide tabs
                        '.Tab[data-testid*="affirm"]': {
                          display: 'none !important'
                        },
                        '.Tab[data-testid*="klarna"]': {
                          display: 'none !important'
                        },
                        '.Tab[data-testid*="amazon"]': {
                          display: 'none !important'
                        },
                        // Hide any element containing these names
                        '[data-testid*="affirm"]': {
                          display: 'none !important'
                        },
                        '[data-testid*="klarna"]': {
                          display: 'none !important'
                        },
                        '[data-testid*="amazon"]': {
                          display: 'none !important'
                        },
                        // Hide payment method selectors
                        '.PaymentMethodSelector--affirm': {
                          display: 'none !important'
                        },
                        '.PaymentMethodSelector--klarna': {
                          display: 'none !important'
                        },
                        '.PaymentMethodSelector--amazon_pay': {
                          display: 'none !important'
                        },
                        // Hide horizontal card layouts for Klarna specifically
                        '[class*="klarna"]': {
                          display: 'none !important'
                        },
                        '[class*="Klarna"]': {
                          display: 'none !important'
                        },
                        '.PaymentMethodCard--klarna': {
                          display: 'none !important'
                        },
                        '.PaymentMethodCard[data-payment-method-type="klarna"]': {
                          display: 'none !important'
                        },
                        '.HorizontalPaymentMethod--klarna': {
                          display: 'none !important'
                        },
                        // Target cards containing "Klarna" text
                        '.PaymentMethodCard:has([aria-label*="Klarna"])': {
                          display: 'none !important'
                        },
                        '.PaymentMethodCard:has([alt*="Klarna"])': {
                          display: 'none !important'
                        }
                      }
                    }
                  }}
                  key={clientSecret} // Force remount when clientSecret changes
                >
                  <CheckoutForm amount={donationAmount} />
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