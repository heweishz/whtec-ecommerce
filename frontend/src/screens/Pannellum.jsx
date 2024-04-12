// import pannellum from '../utils/pannellum.js';
import { useRef } from 'react';
import glassroom from '../assets/glassroom01.jpeg';
const Pannellum = () => {
  const ref = useRef(null);

  return (
    <div ref={ref} style={{ width: '400px', height: '400px' }}>
      <img src={glassroom} alt='' width='400px' />
    </div>
  );
};
export default Pannellum;
