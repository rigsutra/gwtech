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
} from "@chakra-ui/react";
import { RiUserAddLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

function SupervisorManagement() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [isAddMode, setIsAddMode] = useState(true); // New state to track mode

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api().get(`/subadmin/getsuperVisor`);
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSupervisors();
  }, []);

  const createUser = () => {
    api()
      .post(`/subadmin/addsuperVisor`, {
        userName,
        password,
        isActive,
        companyName,
      })
      .then((response) => {
        setUsers([...users, response.data]);
        resetForm();
        onClose();
        toast({
          title: "Supervisor created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error creating Supervisor.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const updateUser = (id) => {
    const requestBody = {
      userName: userName || currentUser.userName, // Use existing value if not updated
      companyName: companyName || currentUser.companyName, // Use existing value if not updated
      isActive: isActive !== undefined ? isActive : currentUser.isActive, // Update only if specified
    };

    if (password !== "") {
      requestBody.password = password; // Only add password if provided
    }

    api()
      .patch(`/subadmin/updatesuperVisor/${id}`, requestBody)
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        resetForm();
        setEditing(false);
        setCurrentUser(null);
        onClose();
        toast({
          title: "Supervisor updated.",
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
      .delete(`/subadmin/deletesuperVisor/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== id));
        toast({
          title: "Supervisor deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Error deleting Supervisor.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleUserNameChange = (event) => {
    setUserName(event.target.value.trim());
  };

  const handleCompanyNameChange = (event) => {
    setCompanyName(event.target.value.trim());
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value.trim());
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!userName || !companyName) {
      toast({
        title: "Error",
        description: "Username and company name are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isAddMode) {
      createUser();
    } else {
      updateUser(currentUser._id);
    }
  };

  const handleEdit = (user) => {
    setEditing(true);
    setIsAddMode(false); // Set to false for edit mode
    setCurrentUser(user);
    setUserName(user.userName);
    setPassword(""); // Reset password for security
    setCompanyName(user.companyName);
    setIsActive(user.isActive);
    onOpen();
  };

  const handleAddSupervisor = () => {
    setEditing(false);
    setIsAddMode(true); // Set to true for add mode
    resetForm();
    onOpen();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setUserName("");
    setPassword("");
    setCompanyName("");
    setIsActive(true);
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      {/* Supervisors Table */}
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
            Supervisor Table
          </Text>
          <Button
            size="sm"
            onClick={handleAddSupervisor} // Separate button to add supervisor
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
                <Th color="black">Name</Th>
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
                    <pre>{user.companyName}</pre>
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
        title={isAddMode ? "Create User" : "Edit User"} // Change title based on mode
        submitButtonText={isAddMode ? "Create" : "Update"} // Change button text based on mode
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              bg={colorMode === "light" ? "white" : "gray.700"}
              color={colorMode === "light" ? "gray.800" : "white"}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Company Name</FormLabel>
            <Input
              type="text"
              value={companyName}
              onChange={handleCompanyNameChange}
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

export default SupervisorManagement;
