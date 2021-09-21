import { AxiosResponse } from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stockResult: AxiosResponse<Stock> = await api.get(`/stock/${productId}`)

      const stockAmount = stockResult.data?.amount

      if (stockAmount === 0) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const { data: productToAdd }: AxiosResponse<Product> = await api.get(`/products/${productId}`)
      const productInCart = cart.find(product => product.id === productId)

      if (!productInCart) {
        //  Caso não tenha o produto selecionado no carrinho
        const cartUpdated = [...cart, {
          ...productToAdd,
          amount: 1
        }]
        setCart(cartUpdated)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated))

      } else {
        //  Caso tenha o produto selecionado no carrinho
        if (productInCart?.amount + 1 > stockAmount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }
        productInCart.amount += 1
        const cartUpdated = [
          ...cart.filter(product => product.id !== productInCart.id),
          productInCart
        ]

        setCart(cartUpdated)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated))
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productToRemove = cart.find(product => product.id === productId)
      if (!productToRemove) {
        throw new Error('Erro na remoção do produto')
      }
      const newCart = cart.filter(product => product.id !== productId)
      setCart(newCart)
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
    } catch {
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      if(amount <= 0){
        return
      }
      const stockResult: AxiosResponse<Stock> = await api.get(`/stock/${productId}`)
      const stockAmount = stockResult.data.amount

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      const cartUpdated = cart.reduce((acc : Product[], product) => {
        const data = product.id === productId ? {
          ...product,
          amount: amount
        } : product

        acc.push(data)
        
        return acc
      }, [])

      setCart(cartUpdated)
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated))
    } catch (err) {
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
