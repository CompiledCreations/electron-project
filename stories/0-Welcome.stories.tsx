import React from "react";
import { linkTo } from "@storybook/addon-links";
import { Welcome } from "@storybook/react/demo";

export default {
  title: "Welcome",
  component: Welcome
};

export const ToStorybook: React.FC = () => <Welcome showApp={linkTo("Button")} />;

(ToStorybook as any).story = {
  name: "to Storybook"
};
