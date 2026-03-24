import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setOutputLocation("out/");
Config.setCrf(18);

Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      {
        test: /\.ya?ml$/,
        use: "yaml-loader",
      },
    ],
  },
}));
