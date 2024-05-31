'use client'
import { FaCartShopping } from "react-icons/fa6"
import { FaCheck } from "react-icons/fa"
import { IoIosArrowBack, IoIosCloseCircle } from "react-icons/io";
import { Puff } from "react-loading-icons";
import { useEffect, useState, useMemo, useCallback } from "react";
import db from "./db.json";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface CartItem {
  id: string;
  quantity: number;
}

export default function Home() {
  const [state, setState] = useState({
    isOpen: false,
    cart: [] as CartItem[],
    isCheckingOut: false,
    addedProduct: '',
    paid: false,
    isPaying: false,
  });

  const handleOpenCart = useCallback(() => setState((prev) => ({ ...prev, isOpen: !prev.isOpen })), []);
  const handleCheckout = useCallback(() => setState((prev) => ({ ...prev, isCheckingOut: true, isOpen: false })), []);
  const handlePay = useCallback(() => {
    setState((prev) => ({ ...prev, isPaying: true }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, paid: true, isPaying: false }));
      const current = localStorage.getItem('orders');
      const orders = current ? JSON.parse(current) : [];
      console.log(state.cart);
      
      orders.push({ id: Math.floor(Math.random() * 100) + 1, items: state.cart });
      localStorage.setItem('orders', JSON.stringify(orders))
    }, 2000);
  }, []);
  
  const handleAddToCart = useCallback((id: string) => {
    setState((prev) => {
      const itemIndex = prev.cart.findIndex((item) => item.id === id);
      const newCart = [...prev.cart];
      if (itemIndex === -1) {
        newCart.push({ id, quantity: 1 });
      } else {
        newCart[itemIndex].quantity += 1;
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return { ...prev, cart: newCart, addedProduct: id };
    });
    setTimeout(() => setState((prev) => ({ ...prev, addedProduct: '' })), 2000);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((prev) => {
      const itemIndex = prev.cart.findIndex((item) => item.id === id);
      if (itemIndex === -1) return prev;
      const newCart = [...prev.cart];
      newCart[itemIndex].quantity -= 1;
      if (newCart[itemIndex].quantity === 0) newCart.splice(itemIndex, 1);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return { ...prev, cart: newCart };
    });
  }, []);

  useEffect(() => {
    const current = localStorage.getItem('cart');
    if (current) {
      setState((prev) => ({ ...prev, cart: JSON.parse(current) }));
    }
  }, []);

  const totalAmount = useMemo(() => {
    return state.cart.reduce((acc, item) => {
      const price = db.find((product: Product) => product.id === item.id)?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  }, [state.cart]);

  const resetCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [], paid: false, isCheckingOut: false }));
    localStorage.setItem('cart', JSON.stringify([]));
  }, []);

  return (
    <main>
      <div className="z-50 fixed top-0 w-full p-3 border border-black flex justify-end bg-white">
        <FaCartShopping onClick={handleOpenCart} className="w-8 h-8" />
        <div className={`flex flex-col p-1 absolute bg-white top-12 right-0 w-1/2 h-64 border border-black rounded ${state.isOpen ? 'right-0' : 'right-full'}`}>
          <div>
            <p className="font-bold text-lg pb-2">Shopping Cart</p>
            {state.cart.map((item, index) => {
              const product = db.find((product: Product) => product.id === item.id);
              if (!product) return null;
              return (
                <div key={index} className="flex justify-between w-full">
                  <div className="w-1/2">
                    <p className="font-semibold">{product.name}</p>
                  </div>
                  <div className="flex justify-between w-24">
                    <button onClick={() => removeFromCart(item.id)}>-</button>
                    <p>{item.quantity}</p>
                    <button onClick={() => handleAddToCart(item.id)}>+</button>
                  </div>
                  <div className="w-1/4 text-right">
                    <p>${((product.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-full px-2 absolute left-0 bottom-2">
            <button className="bg-blue-500 p-2 text-white rounded left-0 text-xl" onClick={handleCheckout}>
              {`Total $${(totalAmount / 100).toFixed(2)} Checkout`}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center w-full mx-auto mt-16">
        {db.map((item: Product, index) => (
          <div key={index} className="border border-black w-64 h-72 m-2 flex flex-col items-center rounded-lg relative drop-shadow">
            <a className="/item/1" href={`/item/${item.id}`}>
              <div className="h-36 w-full rounded-lg rounded-b-none" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></div>
              <div className="px-2 flex flex-col w-full h-24">
                <p className="font-bold text-sm pb-1 w-full">{item.name}</p>
                <p className="text-xs">{item.description}</p>
                <p className="text-xl">${(item.price / 100).toFixed(2)}</p>
              </div>
            </a>
            <button onClick={() => handleAddToCart(item.id)} className="w-4/5 bg-yellow-300 rounded-md drop-shadow p-2">
              {state.addedProduct === item.id ? <><span>Added to Cart <FaCheck className="absolute right-2 top-3" /></span></> : 'Add to cart'}
            </button>
          </div>
        ))}
      </div>
      {state.isCheckingOut && (
        <div className="fixed left-0 top-0 w-full h-screen bg-black bg-opacity-80 flex flex-col items-center justify-center">
          <div className="w-1/2 bg-white p-3 relative pt-7">
            {!state.paid && <button onClick={() => setState((prev) => ({ ...prev, isCheckingOut: false }))} className="flex items-center mb-2"><IoIosArrowBack className="w-6 h-6" /> Back</button>}
            {state.paid && <button onClick={resetCart} className="absolute right-1 top-1"><IoIosCloseCircle className="w-8 h-8" /></button>}
            {state.paid && (
              <div className="bg-white text-center pb-8">
                <p className="text-3xl">Your order number is #{Math.floor(Math.random() * 100) + 1}</p>
                <p className="text-lg">Thank you!</p>
              </div>
            )}
            {state.cart.map((item, index) => {
              const product = db.find((product: Product) => product.id === item.id);
              if (!product) return null;
              return (
                <div key={index} className="flex justify-between w-full">
                  <div className="w-1/2">
                    <p className="font-semibold">{product.name}</p>
                  </div>
                  <div className="flex justify-between w-24">
                    <p>{item.quantity}</p>
                  </div>
                  <div className="w-1/4 text-right">
                    <p>${((product.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            <p className="w-full pt-5 text-right">{`Total $${(totalAmount / 100).toFixed(2)}`}</p>
            {!state.paid && (
              <button className="bg-blue-800 w-full my-4 text-white rounded p-3 relative" disabled={state.cart.length === 0} onClick={handlePay}>
                Pay {state.isPaying && <Puff className="absolute right-1/3 top-1" />}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
