import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Flex,
  Text,
  VStack,
  SimpleGrid,
  Box,
  Heading,
} from "@chakra-ui/react";
import { GoSignOut } from "react-icons/go";
import { ImUsers } from "react-icons/im";
import { GiPodium } from "react-icons/gi";
import { HiViewGridAdd } from "react-icons/hi";
import {
  FaUserSecret,
  FaFortAwesome,
  FaUserTie,
  FaInfoCircle,
} from "react-icons/fa";
import {
  MdFactCheck,
  MdPayments,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { SiAdblock } from "react-icons/si";
import { RiNumbersFill, RiDeleteBin5Fill } from "react-icons/ri";
import { BsTicketDetailedFill } from "react-icons/bs";
import axios from "axios";

const MainMenu = () => {
  const history = useHistory();

  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    const name = sessionStorage.getItem("userName");
    setUserRole(role);
    setUserName(name);

    // Fetch company name from the backend
    axios
      .get("http://localhost:5000/api/company-name")
      .then((response) => setCompanyName(response.data.companyName))
      .catch((error) => console.error("Error fetching company name", error));
  }, []);

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleSignOut = () => {
    sessionStorage.clear();
    history.push("/auth/signin");
  };

  const roleBasedFunctions = {
    admin: [
      {
        path: "/admin/SubAdminManagement",
        name: "SubAdmin",
        icon: <ImUsers />,
      },
      {
        path: "/admin/LotteryCategoryManagement",
        name: "Lottery Category",
        icon: <HiViewGridAdd />,
      },
      {
        path: "/admin/WinningNumberManagement",
        name: "Win Numbers",
        icon: <GiPodium />,
      },
      {
        path: "/admin/SubAdminSaleReport",
        name: "Sales Report",
        icon: <FaInfoCircle />,
      },
    ],
    subAdmin: [
      {
        path: "/subadmin/SellerManagement",
        name: "Seller",
        icon: <FaUserTie />,
      },
      {
        path: "/subadmin/SupervisorManagement",
        name: "Supervisor",
        icon: <FaUserSecret />,
      },
      {
        path: "/subadmin/paymentcondition",
        name: "Pay Condition",
        icon: <MdPayments />,
      },
      {
        path: "/subadmin/blocknumber",
        name: "Block Number",
        icon: <SiAdblock />,
      },
      {
        path: "/subadmin/addlimit",
        name: "Add Limit",
        icon: <MdProductionQuantityLimits />,
      },
      {
        path: "/subadmin/winningnumberviews",
        name: "Win Number",
        icon: <RiNumbersFill />,
      },
      {
        path: "/subadmin/PercentageLimit",
        name: "Percentage Limit",
        icon: <FaInfoCircle />,
      },
      {
        path: "/subadmin/soldtickets",
        name: "Sold Tickets",
        icon: <MdFactCheck />,
      },
      {
        path: "/subadmin/deleteticket",
        name: "Deleted Ticket",
        icon: <RiDeleteBin5Fill />,
      },
      {
        path: "/subadmin/winningtickets",
        name: "Win Tickets",
        icon: <FaFortAwesome />,
      },
      {
        path: "/subadmin/saledetails",
        name: "Sale Details",
        icon: <BsTicketDetailedFill />,
      },
      {
        path: "/subadmin/salereports",
        name: "Sale Reports",
        icon: <FaInfoCircle />,
      },
    ],
    superVisor: [
      {
        path: "/superVisor/SuperVisorSellerManagement",
        name: "Seller",
        icon: <FaUserTie />,
      },
      {
        path: "/superVisor/SuperVisorSaleDetails",
        name: "Sale Details",
        icon: <BsTicketDetailedFill />,
      },
      {
        path: "/superVisor/SuperVisorWinNumber",
        name: "Win Number",
        icon: <FaFortAwesome />,
      },
      {
        path: "/superVisor/SuperVisorSoldTickets",
        name: "Sold Tickets",
        icon: <MdFactCheck />,
      },
      {
        path: "/superVisor/SuperVisorSaleReports",
        name: "Sale Reports",
        icon: <FaInfoCircle />,
      },
    ],
  };

  const functions = roleBasedFunctions[userRole] || [];

  return (
    <Flex
      width="100%"
      minHeight="100vh"
      flexDirection="column"
      bg="#587a7e"
      align="center"
    >
      {/* Header */}
      <Flex
        as="header"
        background="linear-gradient(145deg, #556d70, #475c5f)"
        boxShadow="5px 5px 6px #1b1e1f, -5px -5px 6px #7ea3a8"
        color="white"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        p={5}
        flexDirection={["column", "row"]}
        textAlign={["center", "left"]}
      >
        <Text fontSize={["lg", "xl"]} fontWeight="bold" mb={[2, 0]}>
          {companyName || "Company Name"}
        </Text>
        <Text
          fontSize={["md", "xl"]}
          fontWeight="bold"
          flexGrow={1}
          textAlign={["center", "center"]}
          mb={[2, 0]}
        >
          Welcome, {userName}
        </Text>
        <Button
          colorScheme="orange"
          bg="orange"
          onClick={handleSignOut}
          mx={[0, 10]}
          mt={[2, 0]}
          p={4}
          fontWeight="bold"
          borderRadius={5}
          fontSize={15}
          leftIcon={<GoSignOut />}
        >
          LogOut
        </Button>
      </Flex>

      {/* Main Menu */}
      <Box
        borderRadius="md"
        maxWidth="1000px"
        background="linear-gradient(145deg, #5e8387, #4f6e71)"
        width={["90%", "80%", "60%", "40%"]}
        mt="2%"
        pb={15}
        boxShadow="6px 6px 8px #6f989c, -6px -6px 8px #6f989c"
      >
        <Heading
          fontSize={["xl", "2xl"]}
          mb={30}
          textAlign="center"
          color="gray.700"
          bg="#fdf9bc"
          mt="0%"
        >
          Main Menu
        </Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing={6} px={[4, 6]}>
          {functions.length > 0 ? (
            functions.map((func) => (
              <VStack key={func.path} spacing={2} align="center">
                <Button
                  onClick={() => handleNavigation(func.path)}
                  borderRadius="50%"
                  width={["60px", "70px", "80px"]}
                  height={["60px", "70px", "80px"]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                  bg="gray.100"
                  color="gray.600"
                  _hover={{ bg: "gray.200" }}
                  fontSize={["24px", "28px", "32px"]}
                >
                  {func.icon}
                </Button>
                <Text
                  fontSize={["sm", "md"]}
                  textAlign="center"
                  color="gray.700"
                >
                  {func.name}
                </Text>
              </VStack>
            ))
          ) : (
            <Text>No functions available for your role.</Text>
          )}
        </SimpleGrid>
      </Box>
    </Flex>
  );
};

export default MainMenu;
