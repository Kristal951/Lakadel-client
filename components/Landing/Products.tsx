import LatestCategory from "@/components/Landing/LatestCategory";
import TopCategories from "@/components/Landing/TopCategories";

export default function Products(){
    return(
        <div className="w-screen h-max flex flex-col justify-start">
            <TopCategories/>
            <LatestCategory/>
        </div>
    )
}