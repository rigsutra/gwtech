import React, { useState } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";
import {
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import api from "../../utils/customFetch.js";

// Color constants for reuse
const COLORS = {
  title: "white",
  text: "white",
  headerBg: "linear-gradient(145deg, #556d70, #475c5f)",
  drawerBg: "#3F3534",
  bodyBg: "#587a7e",
  formBg: "linear-gradient(145deg, #5e8387, #4f6e71)",
  inputBg: "linear-gradient(145deg, #5e8387, #4f6e71)",
  buttonBg: "#475c5f",
};

// Header component
const Header = ({ onDrawerOpen }) => (
  <Flex
    as="header"
    align="center"
    justify="space-between"
    p={2}
    bgGradient={COLORS.headerBg}
    color={COLORS.text}
    position="relative"
    boxShadow="5px 5px 6px #1b1e1f, -5px -5px 6px #7ea3a8"
  >
    <Text fontSize="20px" fontWeight="600" textColor="#fdf9bc" ml="10px">
      LOTTERY SOFT
    </Text>
    <Flex align="center" gap={{ base: 2, md: 6 }}>
      <IconButton
        icon={<HamburgerIcon />}
        variant="outline"
        onClick={onDrawerOpen}
        display={{ base: "flex", md: "none" }}
      />
      <NavigationLinks />
      <RouterLink to="/signin">
        <Button bg="#fdf9bc" mx={4} textColor="black">
          Login
        </Button>
      </RouterLink>
    </Flex>
  </Flex>
);

// Drawer menu component for mobile view
const DrawerMenu = ({ isOpen, onClose }) => (
  <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
    <DrawerOverlay />
    <DrawerContent bg={COLORS.drawerBg}>
      <DrawerCloseButton color="white" />
      <DrawerBody>
        <NavigationLinks vertical />
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

// Links for header and drawer
const NavigationLinks = ({ vertical }) => (
  <Flex
    direction={vertical ? "column" : "row"}
    alignItems={vertical ? "flex-start" : "center"}
    display={{ base: vertical ? "flex" : "none", md: "flex" }}
  >
    {["Home", "Contacts", "Services"].map((route) => (
      <RouterLink to={`/${route}`} key={route}>
        <Button
          variant="link"
          my={2}
          mx={4}
          textColor="antiquewhite"
          fontSize="18px"
          fontWeight="bold"
          cursor="pointer"
        >
          {capitalize(route)}
        </Button>
      </RouterLink>
    ))}
  </Flex>
);

// Login form component
const LoginForm = ({ name, setName, password, setPassword, handleSubmit }) => (
  <Flex direction="column" w="100%" maxW="350px" mx="auto" marginTop="20px">
    <Flex
      direction="column"
      alignItems="center"
      bg={COLORS.inputBg}
      boxShadow="5px 5px 6px #8dc3ca, -5px -5px 6px #8dc3ca"
      py={10}
      px={4}
      borderRadius="10px"
      w="100%"
    >
      <Heading
        color={COLORS.title}
        fontSize={["24px", "28px"]}
        mb={{ base: "30px", md: "50px" }}
        textAlign="center"
        textColor="aliceblue"
        fontWeight="600"
      >
        LOGIN
      </Heading>
      {[
        { label: "Login Name", value: name, onChange: setName },
        {
          label: "Password here",
          value: password,
          onChange: setPassword,
          type: "password",
        },
      ].map(({ label, value, onChange, type = "text" }) => (
        <FormControl key={label} mb={5} w="100%">
          <FormLabel
            fontSize={["16px", "20px"]}
            fontWeight="400"
            textColor="aliceblue"
          >
            {label}
          </FormLabel>

          <Input
            placeholder={label}
            _placeholder={{ color: "white" }}
            type={type}
            value={value}
            width="100%"
            paddingX="10px"
            onChange={(e) => onChange(e.target.value)}
            bg="#83a6aa"
            borderRadius="none"
            textColor="black"
          />
        </FormControl>
      ))}
      <Button
        bg={COLORS.buttonBg}
        type="submit"
        width="100%"
        h="45px"
        my={{ base: "20px", md: "40px" }}
        borderRadius="10px"
        cursor="pointer"
        onClick={handleSubmit}
        boxShadow="0px 1px 1px #233132, -1px -1px 1px #233132"
      >
        <Text color="white" fontSize={["16px", "20px"]} textColor="whitesmoke">
          LOGIN
        </Text>
      </Button>
    </Flex>
  </Flex>
);

function SignIn() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const handleShowToast = (description, status) =>
    toast({
      title: "Alert",
      description,
      status,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api().post(`/auth/signin`, {
        userName: name.trim(),
        password,
      });
      if (response?.data?.success) {
        const { token, user } = response.data;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userRole", user.role);
        sessionStorage.setItem("userName", user.userName);
        sessionStorage.setItem("company", user.companyName);

        handleShowToast(`Welcome Mr.${user.userName}`, "success");
        history.push("/main-menu");
      } else {
        handleShowToast(response?.data?.message || "Login failed", "error");
      }
    } catch (error) {
      console.error(error);
      handleShowToast(
        error.response?.data?.message || "An error occurred",
        "error"
      );
    }
  };

  return (
    <>
      <Header onDrawerOpen={() => setIsOpen(true)} position="fixed" />
      <DrawerMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Flex
        align="center"
        justify="center"
        marginTop="-14"
        minH="100vh"
        bg={COLORS.bodyBg}
      >
        <Flex w="100%" maxW={{ base: "90%", sm: "450px" }} mx="auto" p={5}>
          <LoginForm
            name={name}
            setName={setName}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
          />
        </Flex>
      </Flex>
    </>
  );
}

// Helper function to capitalize text
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default SignIn;
