/*!

=========================================================
* LOTTERY Chakra - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-chakra
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-chakra/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom"; // Import Link for routing
import api from "../../utils/customFetch.js";
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
import { HamburgerIcon } from "@chakra-ui/icons"; // Hamburger icon for the menu
import GradientBorder from "components/GradientBorder/GradientBorder";

function SignIn() {
  const titleColor = "white"; // Color for title text
  const textColor = "white"; // Color for all text in forms and buttons

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false); // State for drawer

  const handleShowToast = (description, status) => {
    toast({
      title: "Alert",
      description: description,
      status: status,
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api().post(`/auth/signin`, {
        userName: name.trim(),
        password: password,
      });
      if (response?.data?.success) {
        await sessionStorage.setItem("token", response?.data?.token);
        sessionStorage.setItem("userRole", response?.data?.user.role);
        sessionStorage.setItem("userName", response?.data?.user.userName);
        
        handleShowToast(
          `Welcome Mr.${response?.data?.user.userName}`,
          `success`
        );
        history.push("/main-menu");
      } else {
        handleShowToast(`${response?.data?.message}`, `error`);
      }
    } catch (error) {
      console.log(error);
      handleShowToast(`${error.response?.data?.message}`, `error`);
    }
  };

  return (
    <>
      {/* Header */}
      <Flex
        as="header"
        alignItems="center"
        justifyContent="space-between"
        p={4}
        bg="#3F3534" // Top banner color
        color="white"
      >
        <Text fontSize="xl" fontWeight="bold">
          LotterySoft
        </Text>

        <Flex alignItems="center">
          <IconButton
            icon={<HamburgerIcon />}
            variant="outline"
            colorScheme="white"
            onClick={() => setIsOpen(true)}
            display={{ base: "flex", md: "none" }} // Show only on small screens
          />
          <RouterLink to="/about">
            <Button
              variant="link"
              color="white"
              mx={4}
              display={{ base: "none", md: "inline-flex" }}
            >
              A propos
            </Button>
          </RouterLink>
          <RouterLink to="/services">
            <Button
              variant="link"
              color="white"
              mx={4}
              display={{ base: "none", md: "inline-flex" }}
            >
              Services
            </Button>
          </RouterLink>
          <RouterLink to="/contacts">
            <Button
              variant="link"
              color="white"
              mx={4}
              display={{ base: "none", md: "inline-flex" }}
            >
              Contacts
            </Button>
          </RouterLink>
          <RouterLink to="/signin">
            <Button colorScheme="orange" mx={4}>
              Login
            </Button>
          </RouterLink>
        </Flex>
      </Flex>

      {/* Drawer Menu */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => setIsOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent bg="#3F3534">
          <DrawerCloseButton color="white" />
          <DrawerBody>
            <Flex direction="column" alignItems="flex-start">
              <RouterLink to="/about">
                <Button variant="link" color="white" my={2}>
                  A propos
                </Button>
              </RouterLink>
              <RouterLink to="/services">
                <Button variant="link" color="white" my={2}>
                  Services
                </Button>
              </RouterLink>
              <RouterLink to="/contacts">
                <Button variant="link" color="white" my={2}>
                  Contacts
                </Button>
              </RouterLink>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Login Form */}
      <Flex
        alignItems="center"
        justifyContent="center"
        minH="100vh"
        bg="#514D4C"
      >
        {" "}
        {/* Background color */}
        <Flex
          h={{ base: "100%", lg: "fit-content" }}
          w="100%"
          maxW={{ base: "90%", sm: "450px" }}
          mx="auto"
          p={5}
        >
          {/* First Form with Title */}
          <Flex
            direction="column"
            w="100%"
            background="#3F3534"
            borderRadius="10px"
          >
            <Heading
              color={titleColor}
              fontSize={{ base: "24px", md: "32px" }}
              mb="5px"
              textAlign="center"
            >
              Login
            </Heading>

            {/* Second Form with Input Fields */}
            <Flex
              direction="column"
              w="100%"
              alignItems="center"
              bg="#5F5F5F"
              borderRadius={10}
              p={10}
            >
              {" "}
              {/* Centering inputs */}
              <FormControl mb={4} w={{ base: "80%", md: "60%" }}>
                {" "}
                {/* Set width for centering */}
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="normal"
                  color={textColor}
                >
                  UserName
                </FormLabel>
                <GradientBorder mb="24px">
                  <Input
                    color={textColor}
                    bg="white"
                    borderRadius="5px"
                    fontSize="sm"
                    placeholder="UserName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </GradientBorder>
              </FormControl>
              <FormControl mb={4} w={{ base: "80%", md: "60%" }}>
                {" "}
                {/* Set width for centering */}
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="normal"
                  color={textColor}
                >
                  Password
                </FormLabel>
                <GradientBorder mb="24px">
                  <Input
                    color={textColor}
                    bg="white"
                    borderRadius="5px"
                    fontSize="sm"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </GradientBorder>
              </FormControl>
              <Button
                bg={"#3F3534"}
                type="submit"
                w={{ base: "80%", md: "60%" }} // Set width for centering
                borderRadius={0}
                maxW="200px"
                h="35"
                mb="50px"
                mt="20px"
                onClick={handleSubmit}
              >
                <Text color="white">Login</Text>
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export default SignIn;
