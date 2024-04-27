import { Pannellum } from 'pannellum-react';
// import alexa from '/images/alexa.jpg';
const PannellumScreen = ({ image }) => {
  return (
    <>
      <div className='App'>
        <Pannellum
          width='100%'
          height='500px'
          image={image}
          pitch={10}
          yaw={180}
          hfov={110}
          autoLoad
          showZoomCtrl={false}
          onLoad={() => {}}
        >
          {/* <Pannellum.Hotspot
            type='custom'
            pitch={31}
            yaw={150}
            handleClick={(evt, name) => console.log(name)}
            name='hs1'
          /> */}
        </Pannellum>
      </div>
    </>
  );
};

export default PannellumScreen;
