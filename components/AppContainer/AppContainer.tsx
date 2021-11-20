import {useCallback, useEffect, useState} from "react";
import {Page, Tabs} from "@shopify/polaris";
import {useAppBridge} from "@shopify/app-bridge-react";
import generateApiInstance from "../../services/Api";
import { SectionsSelector } from "../SectionsSelector/SectionsSelector";

export const AppContainer = ({selectedPage, setSelectedPage}) => {
  const app = useAppBridge();

  const handlePageChange = useCallback(
    (selectedPageIndex) => setSelectedPage(selectedPageIndex),
    [],
  );

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);

  const pages = [
    {
      id: 'sections_selector',
      content: 'Sections Setup',
      accessibilityLabel: 'Sections Setup',
      panelID: 'sections_selector',
      component: <SectionsSelector loading={loading} currentPlan={currentPlan}/>
    }
  ];

  const verifyPlan = async () => {
    const api = await generateApiInstance(app)
    const {data} = await api.get(`api/shopify/verify-plan`)
    setLoading(false)
    if (data.success &&
      data.data.appInstallation && data.data.appInstallation.activeSubscriptions.length &&
      data.data.appInstallation.activeSubscriptions[0]) {
      setCurrentPlan({
        name: data.data.appInstallation.activeSubscriptions[0].name,
        mode: data.data.appInstallation.activeSubscriptions[0].name === "BASIC" ? "BASIC" : "PRO"
      })
    } else {
      setCurrentPlan({
        name: "FREE",
        mode: "BASIC"
      })
    }
  }


  useEffect(() => {
    verifyPlan()
  }, [])

  return (
    <Tabs tabs={pages} selected={selectedPage} onSelect={handlePageChange}>
      {pages[selectedPage].component}
    </Tabs>
  );
}
