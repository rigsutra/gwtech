import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
// Chakra imports
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Td,
  Tr,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  Switch,
  Select, // Import Select for the dropdown
} from "@chakra-ui/react";

import { RiUserAddLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function SellerManagement() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [imei, setImei] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [superVisorId, setSupervisorId] = useState("");

  const [bonusFlag, setBonusFlag] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await api().get(`/superVisor/getseller`);
        console.log(response.data);
        setUsers(response.data.users);
        setCompanyName(response.data.companyName);
        setSupervisorId(response.data.superVisorId);
        setBonusFlag(response.data.bonusFlag);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const updateUser = (id) => {
    const requestBody = {
      isActive,
      superVisorId: superVisorId, // Include selected supervisor ID in update
    };
    api()
      .patch(`/superVisor/updateseller/${id}`, requestBody)
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        resetForm();
        setEditing(false);
        setCurrentUser(null);
        onClose();
        toast({
          title: "User updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error updating user.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const resetForm = () => {
    setUserName("");
    // setPassword("");
    setImei("");
    setIsActive(true);
    // setSelectedSuperVisor(""); // Reset selected supervisor
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editing) {
      updateUser(currentUser._id);
    } else {
      createUser();
    }
  };

  const handleEdit = (user) => {
    setEditing(true);
    setCurrentUser(user);
    // setUserName(user.userName);
    // setPassword(""); // Reset password for security
    setImei(user.imei);
    setIsActive(user.isActive);
    // setSelectedSuperVisor(user.superVisorId || ""); // Set selected supervisor for editing
    onOpen();
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentUser(null);
    resetForm();
    onClose();
  };

  const handleImeiChange = (event) => {
    setImei(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  //   const handleSuperVisorChange = (event) => {
  //     setSelectedSuperVisor(event.target.value); // Update selected supervisor ID
  //   };

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      pt={{ base: "120px", md: "75px" }}
    >
      {/* Sellers Table */}
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="50%"
        justifyContent="center"
        border={{ base: "none", md: "1px solid gray" }}
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
        >
          <Text fontSize="lg" color="black" fontWeight="bold">
            Seller Table
          </Text>
          <Button
            size="sm"
            onClick={onOpen}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <RiUserAddLine size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody>
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">Seller</Th>
                <Th color="black">Company</Th>
                <Th color="black">Active</Th>
                <Th color="black">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user._id}>
                  <Td>
                    <pre>{user.userName}</pre>
                  </Td>
                  <Td>
                    <pre>{companyName}</pre>
                  </Td>
                  <Td>
                    <pre>{user.isActive ? "Yes" : "No"}</pre>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => handleEdit(user)}
                      bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                      _hover={{
                        bg: colorMode === "light" ? "yellow.600" : "yellow.200",
                      }}
                    >
                      <FaEdit size={20} color="white" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit User" : "Create User"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          {/* <FormControl>
            <FormLabel>Seller Name</FormLabel>
            <Input
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl> */}
          <FormControl>
            <FormLabel>Device ID</FormLabel>
            <Input
              type="text"
              value={imei}
              onChange={handleImeiChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          {/* <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl> */}
          {/* <FormControl>
            <FormLabel>Supervisor</FormLabel>
            <Select
              placeholder="Select Supervisor"
              value={selectedSuperVisor}
              onChange={handleSuperVisorChange} // Handle change for supervisor selection
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              {superVisors.map((superVisor) => (
                <option key={superVisor._id} value={superVisor._id}>
                  {superVisor.userName}
                </option>
              ))}
            </Select>
          </FormControl> */}
          <FormControl>
            <FormLabel>Active</FormLabel>
            <Checkbox
              isChecked={isActive}
              onChange={handleIsActiveChange}
              colorScheme={colorMode === "light" ? "blue" : "gray"}
            >
              Active
            </Checkbox>
          </FormControl>
        </Stack>
      </Modal>
    </Flex>
  );
}

export default SellerManagement;
