'use client'
import Link from "next/link"
import db from "../../db.json"
import { IoIosArrowBack } from "react-icons/io";

export default function Page({
  params: { id: itemId },
}: {
  params: { id: string }
}) {
  const item = db.find((item: any) => item.id === itemId)
  const handleAddToCart = () => {
    const current = localStorage.getItem('cart');
    const cart = current ? JSON.parse(current) : [];
    const itemIndex = cart.findIndex((item: any) => item.id === itemId);
    const newCart = [...cart];
    if (itemIndex === -1) {
      newCart.push({ id: itemId, quantity: 1 });
    } else {
      newCart[itemIndex].quantity += 1;
    }
    localStorage.setItem('cart', JSON.stringify(newCart));
  }
  return (
    <main className="">
      <Link className="flex p-3" href="/"><IoIosArrowBack className="w-6 h-6" /> Back to Items</Link>
      <div className="flex flex-col md:flex-row">
        <div>
          {item && <img src={item.imageUrl} alt={item.name} />}
        </div>
        <div className="p-3">
          {item && <p className="font-bold text-3xl">{item.name}</p>}
          {item && <p className="py-3">{item.description}</p>}
          {item && <p className="font-semibold text-2xl">${(item.price / 100).toFixed(2)}</p>}
          <button onClick={() => handleAddToCart()} className="w-full bg-yellow-300 rounded-md drop-shadow p-2 my-3">Add To Cart</button>
        </div>
      </div>
    </main>
  )
}