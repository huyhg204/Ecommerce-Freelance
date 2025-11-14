import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './css/styles.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Home from './page/Home'
import Login from './page/Login'
import Register from './page/Register'
import Carts from './page/Carts'
import ProductsDetail from './page/ProductsDetail'
import CheckOut from './page/CheckOut'
import ProductList from './page/ProductList'
import Profile from './page/Profile'
import WishList from './page/WishList'
import Error from './page/Error'

function App() {
  return (
    <Router>
      <div>
        <Nav />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Home />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Carts />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductsDetail />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
