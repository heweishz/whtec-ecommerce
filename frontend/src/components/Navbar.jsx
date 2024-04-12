import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as OfferIcon } from '../assets/svg/localOfferIcon.svg';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';
import styles from './Navbar.module.css';
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMatchRoute = (route) => {
    if (route === location.pathname) {
      return true;
    }
  };
  return (
    <footer className={styles.navbar}>
      <nav className={styles.navbarNav}>
        <ul className={styles.navbarListItems}>
          <li className={styles.navbarListItem} onClick={() => navigate('/')}>
            <ExploreIcon
              fill={pathMatchRoute('/') ? '#2c2c2c' : '#8f8f8f'}
              width='25px'
              height='25px'
            />
            <p
              className={
                pathMatchRoute('/')
                  ? styles.navbarListItemNameActive
                  : styles.navbarListItemName
              }
            >
              首页
            </p>
          </li>
          <li
            className={styles.navbarListItem}
            onClick={() => navigate('/cart')}
          >
            <OfferIcon
              fill={pathMatchRoute('/cart') ? '#2c2c2c' : '#8f8f8f'}
              width='25px'
              height='25px'
            />
            <p
              className={
                pathMatchRoute('/offers')
                  ? styles.navbarListItemNameActive
                  : styles.navbarListItemName
              }
            >
              购物车
            </p>
          </li>
          <li
            className={styles.navbarListItem}
            onClick={() => navigate('/profile')}
          >
            <PersonOutlineIcon
              fill={pathMatchRoute('/profile') ? '#2c2c2c' : '#8f8f8f'}
              width='25px'
              height='25px'
            />
            <p
              className={
                pathMatchRoute('/profile')
                  ? styles.navbarListItemNameActive
                  : styles.navbarListItemName
              }
            >
              我的订单
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
export default Navbar;
