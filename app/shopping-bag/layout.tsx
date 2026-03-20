import Header from "@/components/shop/Header";

export default function ShoppingBagLayout({children}: {
  children: React.ReactNode;
}){
    return(
        <div className="flex-1 w-full mt-22">
            <Header/>
            {/* <TopBar/> */}
            {children}
        </div>
    )
}