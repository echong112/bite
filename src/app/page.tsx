'use client'
import { FaCartShopping } from "react-icons/fa6"
import { FaCheck } from "react-icons/fa"
import { useEffect, useState } from "react"
import db from "./db.json"
import { IoIosArrowBack } from "react-icons/io";
import { Puff } from "react-loading-icons"
import { IoIosCloseCircle } from "react-icons/io";
export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<any>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [addedProduct, setAddedProduct] = useState('')
  const [paid, setPaid] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const handleOpenCart = () => setIsOpen(!isOpen)
  const handleCheckout = () => {
    setIsCheckingOut(true)
    setIsOpen(false)
  }
  const handlePay = () => {
    setIsPaying(true)
    setTimeout(() => {
      setPaid(true)
      setIsPaying(false)

      const current = localStorage.getItem('orders');
      const orders = current ? JSON.parse(current) : [];
      
      orders.push({ id: Math.floor(Math.random() * 100) + 1, items: cart });
      localStorage.setItem('orders', JSON.stringify(orders))
    }, 2000)
  }
  const handleAddToCart = (id: string) => {
    setAddedProduct(id)
    setTimeout(() => {
      setAddedProduct('')
    }, 2000)
    const itemIndex = cart.findIndex((item: any) => item.id === id)
    let newCart
    if (itemIndex === -1) {
      newCart = [...cart, { id, quantity: 1 }]
    } else {
      newCart = [...cart]
      newCart[itemIndex].quantity += 1
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }
  const removeFromCart = (id: string) => {
    const itemIndex = cart.findIndex((item: any) => item.id === id)
    if (itemIndex === -1) {
      return
    } else {
      const newCart = [...cart]
      newCart[itemIndex].quantity -= 1
      if (newCart[itemIndex].quantity === 0) {
        newCart.splice(itemIndex, 1)
      }
      setCart(newCart)
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }
  useEffect(() => {
    const current = localStorage.getItem('cart')
    if (current) {
      setCart(JSON.parse(current))
    }
  }, [])
  return (
    <main>
      <div className="
        z-50
        fixed
        top-0
        w-full
        p-3
        border
        border-black
        flex
        justify-end
      ">
        <FaCartShopping
          onClick={handleOpenCart}
          className="w-8 h-8"
        />
        <div className={`
          flex
          flex-col
          p-1
          absolute
          bg-white
          top-12
          right-0
          w-1/2
          h-64
          border
          border-black
          rounded
          ${isOpen ? 'right-0' : 'right-full'}
        `}>
          <div>
            <p className="font-bold text-lg pb-2">Shopping Cart</p>
            {cart.map((item: any, index: number) => {
              const price = db.find((product: any) => product.id === item.id)?.price || 0
              return (
                <div key={index} className="flex justify-between w-full">
                  <div className="w-1/2">
                    <p className="font-semibold">{db.find((product: any) => product.id === item.id)?.name}</p>
                  </div>
                  <div className="flex justify-between w-24">
                    <button onClick={() => removeFromCart(item.id)}>-</button>
                    <p>{item.quantity}</p>
                    <button onClick={() => handleAddToCart(item.id)}>+</button>
                  </div>
                  <div className="w-1/4 text-right">
                    <p className="">${((price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="w-full px-2 absolute left-0 bottom-2">
            <button className="bg-blue-500 p-2 text-white rounded left-0 text-xl" onClick={handleCheckout}>
              {`Total $${(cart.reduce((acc: number, item: any) => {
                const price = db.find((product: any) => product.id === item.id)?.price || 0
                return acc + (price * item.quantity)
              }, 0) / 100).toFixed(2)}`}
              Checkout
            </button>
          </div>
        </div>
      </div>
      <div className="
        flex
        flex-wrap
        justify-center
        w-full
        lg:w-3/4
        mx-auto
        mt-16
      ">
        {db.map((item, index) => (
          <div
            key={index}  
          className="
            border
            border-black
            w-64
            h-72
            m-2
            flex
            flex-col
            items-center
            rounded-lg
            relative
            drop-shadow
          ">
            <a className="/item/1" href={`/item/${item.id}`}>
              <div className="h-36 w-full rounded-lg rounded-b-none " style={{
                backgroundImage: `url(${item.imageUrl})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}>
              </div>
              <div className="px-2 flex flex-col w-full h-24">
                <p className="font-bold text-sm pb-1 w-full">{item.name}</p>
                <p className="text-xs">{item.description}</p>
                <p className="text-xl">${(item.price / 100).toFixed(2)}</p>
              </div>
            </a>
            <button
              onClick={() => handleAddToCart(item.id)}
              className="
                w-4/5
                bg-yellow-300
                rounded-md
                drop-shadow
                p-2
              "
            >
              {addedProduct === item.id ? <>
                <span className="">Added to Cart <FaCheck className="absolute right-2 top-3" /></span>
              </> : 'Add to cart'}
            </button>
          </div>
        ))}
      </div>
      {isCheckingOut && (
        <div className="
          fixed
          left-0
          top-0
          w-full
          h-screen
          bg-black
          bg-opacity-80
          flex
          flex-col
          items-center
          justify-center
        ">
          <div className="w-1/2 bg-white p-3 relative pt-7">
            {!paid && (
              <button onClick={() => setIsCheckingOut(false)} className="flex items-center"><IoIosArrowBack /> Back</button>
            )}
            {paid && (
              <button onClick={() => {
                setIsCheckingOut(false)
                setPaid(false)
                setCart([])
                localStorage.setItem('cart', JSON.stringify([]))
              }} className="absolute right-1 top-1"><IoIosCloseCircle className="w-8 h-8" /></button> 
            )}
            {paid && (
              <div className="bg-white text-center pb-8">
                <p className="text-3xl">Your order number is #{Math.floor(Math.random() * 100) + 1}</p>
                <p className="text-lg">Thank you!</p>
              </div> 
            )}
            {cart && cart.map((item: any, index: number) => {
              const price = db.find((product: any) => product.id === item.id)?.price || 0
              return (
                <div key={index} className="flex justify-between w-full">
                  <div className="w-1/2">
                    <p className="font-semibold">{db.find((product: any) => product.id === item.id)?.name}</p>
                  </div>
                  <div className="flex justify-between w-24">
                    <p>{item.quantity}</p>
                  </div>
                  <div className="w-1/4 text-right">
                    <p className="">${((price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              )
            })}
            <p className="w-full pt-5 text-right">{`Total $${(cart.reduce((acc: number, item: any) => {
                const price = db.find((product: any) => product.id === item.id)?.price || 0
                return acc + (price * item.quantity)
              }, 0) / 100).toFixed(2)}`}
            </p>
            {!paid && (
              <button
                className="
                  bg-blue-800
                  w-full
                  my-4
                  text-white
                  rounded
                  p-3
                  relative
                "
                disabled={cart.length === 0}
                onClick={handlePay}>
                Pay {isPaying && <Puff className="absolute right-1/3 top-1" />}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}