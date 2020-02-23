import React from "react";

import styles from "./App.module.scss";
import logo from "./Logo.svg";

export const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <img className={styles.logo} src={logo} />
      <h1>Hello, World!</h1>
    </div>
  );
};
