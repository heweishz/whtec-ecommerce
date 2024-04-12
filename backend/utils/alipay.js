import AlipaySdk from 'alipay-sdk';
const alipaySdk = new AlipaySdk.default({
  appId: process.env.APPID,
  signType: 'RSA2',
  camelcase: true,
  gateway: process.env.ALIPAY_GATEWAY, // 支付宝网关地址 ，沙箱环境下使用时需要修改

  alipayPublicKey: process.env.ALIPAY_PUBLICKEY,
  privateKey: process.env.PRIVATEKEY,
});
export default alipaySdk;
