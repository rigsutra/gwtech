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
  useBreakpointValue,
  Container,
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

  // Define responsive icon sizes
  const iconSize = useBreakpointValue({
    base: "20px",
    sm: "24px",
    md: "28px",
    lg: "32px",
  });

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    const name = sessionStorage.getItem("userName");
    const company = sessionStorage.getItem("company");
    setUserRole(role);
    setUserName(name);
    setCompanyName(company);

    // Fetch company name from the backend
    // axios
    //   .get(``)
    //   .then((response) => setCompanyName(response.data.companyName))
    //   .catch((error) => console.error("Error fetching company name", error));
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
        icon: ImUsers,
      },
      {
        path: "/admin/LotteryCategoryManagement",
        name: "Lottery Category",
        icon: HiViewGridAdd,
      },
      {
        path: "/admin/WinningNumberManagement",
        name: "Win Numbers",
        icon: GiPodium,
      },
      {
        path: "/admin/SubAdminSaleReport",
        name: "Sales Report",
        icon: FaInfoCircle,
      },
    ],
    subAdmin: [
      {
        path: "/subadmin/SellerManagement",
        name: "Seller",
        icon: FaUserTie,
      },
      {
        path: "/subadmin/SupervisorManagement",
        name: "Supervisor",
        icon: FaUserSecret,
      },
      {
        path: "/subadmin/paymentcondition",
        name: "Pay Condition",
        icon: MdPayments,
      },
      {
        path: "/subadmin/blocknumber",
        name: "Block Number",
        icon: SiAdblock,
      },
      {
        path: "/subadmin/addlimit",
        name: "Add Limit",
        icon: MdProductionQuantityLimits,
      },
      {
        path: "/subadmin/winningnumberviews",
        name: "Win Number",
        icon: RiNumbersFill,
      },
      {
        path: "/subadmin/PercentageLimit",
        name: "Percentage",
        icon: FaInfoCircle,
      },
      {
        path: "/subadmin/soldtickets",
        name: "Sold Tickets",
        icon: MdFactCheck,
      },
      {
        path: "/subadmin/deleteticket",
        name: "Deleted Ticket",
        icon: RiDeleteBin5Fill,
      },
      {
        path: "/subadmin/winningtickets",
        name: "Win Tickets",
        icon: FaFortAwesome,
      },
      {
        path: "/subadmin/saledetails",
        name: "Sale Details",
        icon: BsTicketDetailedFill,
      },
      {
        path: "/subadmin/salereports",
        name: "Sale Reports",
        icon: FaInfoCircle,
      },
    ],
    superVisor: [
      {
        path: "/superVisor/SuperVisorSellerManagement",
        name: "Seller",
        icon: FaUserTie,
      },
      {
        path: "/superVisor/SuperVisorSaleDetails",
        name: "Sale Details",
        icon: BsTicketDetailedFill,
      },
      {
        path: "/superVisor/SuperVisorWinNumber",
        name: "Win Number",
        icon: FaFortAwesome,
      },
      {
        path: "/superVisor/SuperVisorSoldTickets",
        name: "Sold Tickets",
        icon: MdFactCheck,
      },
      {
        path: "/superVisor/SuperVisorSaleReports",
        name: "Sale Reports",
        icon: FaInfoCircle,
      },
    ],
  };

  const functions = roleBasedFunctions[userRole] || [];

  console.log(companyName);
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
        flexDirection="row"
        p="15px"
        px="30px"
        textAlign={["center", "left"]}
      >
        <Flex fontSize="20px" fontWeight="bold" mb={[2, 0]} color="#fdf9bc">
          {userRole === "admin" && companyName && <>{companyName}</>}
          {userRole === "subAdmin" && companyName && <>{companyName}</>}
          {userRole === "superVisor" && companyName && (
            <>
              {companyName} ,{userName && <>{userName}</>}
            </>
          )}
        </Flex>
        <Text
          fontSize={["md", "xl"]}
          fontWeight="bold"
          flexGrow={1}
          textAlign={["center", "center"]}
          mb={[2, 0]}
        ></Text>
        <Button
          colorScheme="orange"
          bg="#fdf9bc"
          onClick={handleSignOut}
          mx={[0, 10]}
          mt={[2, 0]}
          p={4}
          fontWeight="bold"
          borderRadius={5}
          fontSize={{ base: "14px", md: "16px" }}
          leftIcon={<GoSignOut />}
        >
          LogOut
        </Button>
      </Flex>

      {/* Main Menu */}
      <Box
        as="div"
        background="linear-gradient(145deg, #5e8387, #4f6e71)"
        width={{ sm: "100%", lg: "50%" }}
        mt="2%"
        pb={15}
        boxShadow="6px 6px 8px #6f989c, -6px -6px 8px #6f989c"
        px={{ base: 4, md: 6 }}
      >
        <Heading
          fontSize={["xl", "2xl"]}
          mb={6}
          textAlign="center"
          color="gray.700"
          bg="#fdf9bc"
          py={4}
          marginTop="-6px"
        >
          Main Menu
        </Heading>
        <SimpleGrid
          columns="4" // Responsive column count
          spacing={6}
          pt={20}
        >
          {functions.length > 0 ? (
            functions.map((func) => (
              <VStack
                key={func.path}
                spacing={2}
                align="center"
                mb={20}
                px={10}
              >
                <Button
                  onClick={() => handleNavigation(func.path)}
                  borderRadius="50%"
                  width="40px"
                  height="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="#fdf9bc"
                  border="none"
                >
                  <func.icon size="20" />
                </Button>
                <Text
                  textAlign="center"
                  color="#fdf9bc"
                  fontWeight="bold"
                  fontSize="16px"
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
