import { Pannellum } from 'pannellum-react';
// import alexa from '/images/alexa.jpg';
const PannellumScreen = ({ image }) => {
  const redirectToProduct = (order) => {
    // Manually redirect using window.location.href
    window.location.href = `${window.location.origin}/cart`;
  };
  return (
    <>
      <div className='App'>
        <Pannellum
          width='100%'
          height='500px'
          image={image}
          pitch={-13}
          yaw={33}
          hfov={110}
          autoLoad
          showZoomCtrl={false}
          onLoad={() => {}}
          hotspotDebug={false}
          // onMousedown={(evt) => {
          //   console.log('mouse down', evt);
          // }}
        >
          <Pannellum.Hotspot
            type='info'
            text='饮料'
            pitch={-2.3}
            yaw={-3.5}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}/category/饮料`}
          />
          <Pannellum.Hotspot
            type='info'
            text='卤味'
            pitch={-15}
            yaw={71}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}/category/卤味`}
          />
          <Pannellum.Hotspot
            type='info'
            text='结算'
            pitch={-7.8}
            yaw={50.1}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}/cart`}
          />
        </Pannellum>
      </div>
    </>
  );
};

export default PannellumScreen;
