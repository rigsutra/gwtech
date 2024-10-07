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
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [superVisors, setSuperVisors] = useState([]); // Store supervisors list
  const [selectedSuperVisor, setSelectedSuperVisor] = useState(""); // Selected supervisor ID

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [bonusFlag, setBonusFlag] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api().get(`/subadmin/getsupervisors`);
        setSuperVisors(response.data.users); // Set the fetched supervisors
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupervisors();
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await api().get(`/subadmin/getseller`);
        setUsers(response.data.users);
        setCompanyName(response.data.companyName);
        setBonusFlag(response.data.bonusFlag);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const createUser = () => {
    api()
      .post(`/subadmin/addseller`, {
        userName: userName.trim(),
        password,
        isActive,
        imei: imei.trim(),
        superVisorId: selectedSuperVisor, // Use selected supervisor ID
      })
      .then((response) => {
        setUsers([...users, response.data]);
        resetForm();
        onClose();
        toast({
          title: "Seller created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating Seller.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateUser = (id) => {
    const requestBody = {
      isActive,
      userName: userName.trim(),
      imei: imei.trim(),
      superVisorId: selectedSuperVisor, // Include selected supervisor ID in update
    };
    if (password !== "") {
      requestBody.password = password;
    }
    api()
      .patch(`/subadmin/updateseller/${id}`, requestBody)
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

  const deleteUser = (id) => {
    api()
      .delete(`/subadmin/deleteseller/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        toast({
          title: "User deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error deleting user.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const resetForm = () => {
    setUserName("");
    setPassword("");
    setImei("");
    setIsActive(true);
    setSelectedSuperVisor(""); // Reset selected supervisor
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
    setUserName(user.userName);
    setPassword(""); // Reset password for security
    setImei(user.imei);
    setIsActive(user.isActive);
    setSelectedSuperVisor(user.superVisorId || ""); // Set selected supervisor for editing
    onOpen();
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrentUser(null);
    resetForm();
    onClose();
  };

  // Handlers for input changes
  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handleImeiChange = (event) => {
    setImei(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  const handleSuperVisorChange = (event) => {
    setSelectedSuperVisor(event.target.value); // Update selected supervisor ID
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      {/* Sellers Table */}
      <Card
        overflowX={{ sm: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="100%"
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
                <Th color="black">Supervisor</Th>
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
                    <pre>{user.superVisorName || "N/A"}</pre>
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
                    <Button
                      size="sm"
                      onClick={() => deleteUser(user._id)}
                      bg={colorMode === "light" ? "red.500" : "red.300"}
                      _hover={{
                        bg: colorMode === "light" ? "red.600" : "red.200",
                      }}
                    >
                      <RiDeleteBinLine size={20} color="white" />
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
          <FormControl>
            <FormLabel>Seller Name</FormLabel>
            <Input
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
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
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
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
                  {superVisor.users}
                </option>
              ))}
            </Select>
          </FormControl>
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
