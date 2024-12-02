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
          pitch={-2.1}
          yaw={-133}
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
            pitch={-1.0}
            yaw={-166}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}?table=13`}
          />
          <Pannellum.Hotspot
            type='info'
            text='卤味'
            pitch={-18.8}
            yaw={-123.8}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}?table=20`}
          />
          <Pannellum.Hotspot
            type='info'
            text='结算'
            pitch={-2.6}
            yaw={-105.5}
            // handleClick={(evt, name) => redirectToProduct()}
            // name='hs1'
            URL={`${window.location.origin}?table=8`}
          />
        </Pannellum>
      </div>
    </>
  );
};

export default PannellumScreen;
