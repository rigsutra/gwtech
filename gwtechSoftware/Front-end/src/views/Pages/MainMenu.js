import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Flex, Text, IconButton, Image } from "@chakra-ui/react";
import { GoSignOut } from "react-icons/go"; // Import an icon for sign out
import { ImUsers } from "react-icons/im";
import { GiPodium } from "react-icons/gi";
import { HiViewGridAdd } from "react-icons/hi";
import { FaUserSecret } from "react-icons/fa";
import { FaFortAwesome } from "react-icons/fa";
import { MdFactCheck } from "react-icons/md";
import { MdPayments } from "react-icons/md";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";
import { SiAdblock } from "react-icons/si";
import { RiNumbersFill } from "react-icons/ri";
import { FaInfoCircle } from "react-icons/fa";
import { BsTicketDetailedFill } from "react-icons/bs";
import { RiDeleteBin5Fill } from "react-icons/ri";

const MainMenu = () => {
  const history = useHistory();

  // Retrieve user role and name from session storage
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    const name = sessionStorage.getItem("userName");

    setUserRole(role);
    setUserName(name);
  }, []);

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    sessionStorage.clear(); // Clear session storage
    history.push("/auth/signin"); // Redirect to sign-in page
  };

  const roleBasedFunctions = {
    admin: [
      {
        path: "/admin/SubAdminManagement",
        name: "SubAdmin",
        icon: <ImUsers color="inherit" size={22} />,
      },
      {
        path: "/admin/LotteryCategoryManagement",
        name: "Lottery Category",
        icon: <HiViewGridAdd color="inherit" size={22} />,
      },
      {
        path: "/admin/WinningNumberManagement",
        name: "Win Numbers",
        icon: <GiPodium color="inherit" size={22} />,
      },
      {
        path: "/admin/SubAdminSaleReport",
        name: "Sales Report",
        icon: <FaInfoCircle color="inherit" size={22} />,
      },
    ],
    subAdmin: [
      {
        path: "/subadmin/SellerManagement",
        name: "Seller",
        icon: <FaUserTie color="inherit" size={22} />,
      },
      {
        path: "/subadmin/SupervisorManagement",
        name: "Supervisor",
        icon: <FaUserSecret color="inherit" size={22} />,
      },
      {
        path: "/subadmin/paymentcondition",
        name: "Pay Condition",
        icon: <MdPayments color="inherit" size={22} />,
      },
      {
        path: "/subadmin/blocknumber",
        name: "Block Number",
        icon: <SiAdblock color="inherit" size={22} />,
      },
      {
        path: "/subadmin/addlimit",
        name: "Add Limit",
        icon: <MdProductionQuantityLimits color="inherit" size={22} />,
      },
      {
        path: "/subadmin/winningnumberviews",
        name: "Win Number",
        icon: <RiNumbersFill color="inherit" size={22} />,
      },
      {
        path: "/subadmin/soldtickets",
        name: "Sold Tickets",
        icon: <MdFactCheck color="inherit" size={22} />,

        layout: "/subadmin",
      },
      {
        path: "/subadmin/deleteticket",
        name: "Deleted Ticket",
        icon: <RiDeleteBin5Fill color="inherit" size={22} />,

        layout: "/subadmin",
      },
      {
        path: "/subadmin/winningtickets",
        name: "Win Tickets",
        icon: <FaFortAwesome color="inherit" size={22} />,

        layout: "/subadmin",
      },
      {
        path: "/subadmin/saledetails",
        name: "Sale Details",
        icon: <BsTicketDetailedFill color="inherit" size={22} />,
        layout: "/subadmin",
      },
      {
        path: "/subadmin/salereports",
        name: "Sale Reports",
        icon: <FaInfoCircle color="inherit" size={22} />,

        layout: "/subadmin",
      },
    ],
    supervisor: [
      {
        path: "/SuperVisorSellerManagement",
        name: "Seller Management",
        imgSrc: "/path/to/supervisor-icon.png",
      },
    ],
  };

  const functions = roleBasedFunctions[userRole] || [];

  return (
    <Flex width={"100%"} flexDirection={"column"}>
      <Flex
        as="header"
        bg="#3F3534"
        color="white"
        alignItems="center"
        justifyContent="space-between"
        p={4}
      >
        <Text fontSize="xl" fontWeight="bold" flexGrow={1} textAlign="center">
          Welcome, {userName}
        </Text>
        <Button colorScheme="orange" bg="orange" onClick={handleSignOut} mx={4}>
          LogOut
        </Button>
      </Flex>

      <Flex direction="column" alignItems="center" bg="#514D4C">
        <Flex direction="row" wrap="wrap" justifyContent="center" mt={80}>
          {functions.length > 0 ? (
            functions.map((func) => (
              <Button
                key={func.path}
                onClick={() => handleNavigation(func.path)}
                mb={30}
                mx={80}
                variant="outline"
                borderRadius="50%" // Make buttons circular
                width="100px"
                height="100px"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                {func.icon}
                <Text fontSize="sm">{func.name}</Text>
              </Button>
            ))
          ) : (
            <Text>No functions available for your role.</Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MainMenu;
