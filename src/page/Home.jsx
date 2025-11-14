import ProductsFlashSale from '../components/ProductsFlashSale';
import Category from '../components/Category';
import ProductsBestSelling from '../components/ProductsBestSelling';
import BannerSingle from '../components/BannerSingle';
import ProductsExploreOur from '../components/ProductsExploreOur';
import ProductsNew from '../components/ProductsNew';
import Support from '../components/Support';

const Home = () => {
    return (
        <div>
            <ProductsFlashSale />
            <Category />
            <ProductsBestSelling />
            <BannerSingle />
            <ProductsExploreOur />
            <ProductsNew />
            <Support />
        </div>
    );
};

export default Home;