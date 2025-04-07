import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth.tsx';
import { AuthSheet } from '@/components/auth/auth-sheet';
import { Product } from '@shared/schema';

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
  quantity?: number;
  showIcon?: boolean;
  showText?: boolean;
  tooltipText?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToCartButton({
  product,
  quantity = 1,
  showIcon = true,
  showText = true,
  tooltipText,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleClick = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (isLoading || isSuccess) return;

    setIsLoading(true);
    try {
      await addItem(product, quantity);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        setIsAuthOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const button = (
    <Button
      onClick={handleClick}
      className={className}
      disabled={isLoading}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSuccess ? (
        <Check className="h-4 w-4" />
      ) : showIcon ? (
        <ShoppingCart className={`h-4 w-4 ${showText ? 'mr-2' : ''}`} />
      ) : null}
      {showText && (isSuccess ? 'Added' : 'Add to Cart')}
    </Button>
  );

  return (
    <>
      {tooltipText ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}
      <AuthSheet open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}