import React, {useState} from "react";
import {Frame} from "@shopify/polaris";
import {AppContainer} from "../components/AppContainer/AppContainer";


const Home = ({shopOrigin, host}) => {
  const [selectedPage, setSelectedPage] = useState(0);

  return (
    <Frame>
      <AppContainer selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
    </Frame>
  )
};

export default Home;
