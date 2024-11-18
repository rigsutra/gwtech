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
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
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
  const [superVisors, setSuperVisors] = useState([]);
  const [selectedSuperVisor, setSelectedSuperVisor] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [bonusFlag, setBonusFlag] = useState(false);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await api().get(`/subadmin/getsuperVisor`);
        setSuperVisors(response.data);
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
        const processedUsers = response?.data?.users.map((user) => ({
          ...user,
          // Set superVisorName to "None" if it's "N/A" or falsy
          superVisorName:
            user.superVisorName && user.superVisorName !== "N/A"
              ? user.superVisorName
              : "None",
        }));
        setUsers(processedUsers);
        setCompanyName(response?.data?.companyName);
        setBonusFlag(response?.data?.bonusFlag);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const createUser = async () => {
    try {
      const response = await api().post(`/subadmin/addseller`, {
        userName: userName.trim(),
        password,
        isActive,
        imei: imei.trim(),
        superVisorId: selectedSuperVisor || "",
      });
      // Refresh the users list
      const fetchResponse = await api().get(`/subadmin/getseller`);
      const processedUsers = fetchResponse?.data?.users.map((user) => ({
        ...user,
        superVisorName: user.superVisorName,
      }));
      setUsers(processedUsers);
      resetForm();
      onClose();
      toast({
        title: "Seller created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error creating Seller.",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateUser = async (id, updatedData) => {
    try {
      // Include password only if it's not empty
      if (password !== "") {
        updatedData.password = password;
      }
      // Send the update request
      await api().patch(`/subadmin/updateseller/${id}`, updatedData);

      // Fetch the updated user details
      const response = await api().get(`/subadmin/getseller`);
      // Process the users in the same way as in fetchSellers
      const processedUsers = response?.data?.users.map((user) => ({
        ...user,
        superVisorName: user.superVisorName || "",
      }));
      setUsers(processedUsers);

      toast({
        title: "User updated.",
        description: "The user has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user.",
        description: error.response?.data?.message || "An error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
    setSelectedSuperVisor("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const updatedData = {
      userName: userName.trim(),
      imei: imei.trim(),
      isActive: isActive,
      superVisorId: selectedSuperVisor,
    };

    if (password) {
      updatedData.password = password;
    }

    if (editing) {
      await updateUser(currentUser._id, updatedData);
    } else {
      await createUser();
    }
    onClose();
  };

  const handleEdit = (user) => {
    setEditing(true);
    setCurrentUser(user);
    setUserName(user.userName);
    setPassword("");
    setImei(user.imei);
    setIsActive(user.isActive);
    setSelectedSuperVisor(user.superVisorId);
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
    setSelectedSuperVisor(event.target.value);
  };

  const handleBonusFlag = () => {
    api()
      .patch(`/subadmin/updateBonusFlag`, { bonusFlag: !bonusFlag })
      .then((response) => {
        setBonusFlag(response.data.bonusFlag);
        toast({
          title: "Bonus updated!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Bonus update failed!",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      {/* Sellers Table */}
      <Card
        overflowX="auto"
        p={{ base: "10px", md: "20px" }}
        width={{ base: "100%", md: "80%", lg: "60%" }}
        maxWidth="1200px"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius={"none"}
        boxShadow="lg"
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          flexDirection={{ base: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ base: "flex-start", sm: "center" }}
        >
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="black"
            fontWeight="bold"
          >
            Seller Table
          </Text>
          <FormControl
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={{ base: 2, sm: 0 }}
          >
            <FormLabel htmlFor="bonus-flag" mb="0" fontSize="sm">
              Bonus MRG
            </FormLabel>
            <Switch
              isChecked={bonusFlag}
              size="sm"
              id="bonus-flag"
              onChange={handleBonusFlag}
            />
          </FormControl>
          <Button
            size="sm"
            mt={{ base: 2, sm: 0 }}
            onClick={onOpen}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{
              bg: colorMode === "light" ? "blue.600" : "blue.200",
            }}
          >
            <RiUserAddLine size={20} color="white" />
          </Button>
        </CardHeader>
        <CardBody>
          <Table variant="striped" size="sm">
            <Thead>
              <Tr>
                <Th>Seller</Th>
                <Th>Company</Th>
                <Th>Supervisor</Th>
                <Th>Active</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user._id}>
                  <Td>{user.userName}</Td>
                  <Td>{companyName}</Td>
                  <Td>{user.superVisorName}</Td>
                  <Td>{user.isActive ? "Yes" : "No"}</Td>
                  <Td>
                    <Flex gap={2}>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(user)}
                        bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                        _hover={{
                          bg:
                            colorMode === "light" ? "yellow.600" : "yellow.200",
                        }}
                      >
                        <FaEdit size={16} color="white" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => deleteUser(user._id)}
                        bg={colorMode === "light" ? "red.500" : "red.300"}
                        _hover={{
                          bg: colorMode === "light" ? "red.600" : "red.200",
                        }}
                      >
                        <RiDeleteBinLine size={16} color="white" />
                      </Button>
                    </Flex>
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
        title={editing ? "EDIT SELLER" : "ADD SELLER"}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <ModalContent bg="#A6A6A6" justifyContent="center">
          <ModalHeader
            bg="#7F7F7F"
            textColor="white"
            mb={4}
            display="flex"
            justifyContent="center"
          >
            {editing ? "EDIT SELLER" : "ADD SELLER"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Name:
                  </FormLabel>
                  <Input
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px"
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Device ID:
                  </FormLabel>
                  <Input
                    type="text"
                    value={imei}
                    onChange={handleImeiChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px"
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Password:
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px"
                    isRequired
                  />
                </Flex>
              </FormControl>
              <FormControl>
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Supervisor:
                  </FormLabel>
                  <Select
                    placeholder="Select Supervisor"
                    value={selectedSuperVisor}
                    onChange={handleSuperVisorChange}
                    bg="#bfbfbf"
                    color="black"
                    height="40px"
                    width="300px"
                    isRequired
                  >
                    {superVisors.map((superVisor) => (
                      <option key={superVisor._id} value={superVisor._id}>
                        {superVisor.userName}
                      </option>
                    ))}
                  </Select>
                </Flex>
              </FormControl>
              <FormControl bg="#bfbfbf">
                <Flex alignItems="center">
                  <FormLabel color="#7f7f7f" mb="0" mr={4} width="120px">
                    Active:
                  </FormLabel>
                  <Checkbox
                    isChecked={isActive}
                    onChange={handleIsActiveChange}
                    colorScheme="gray"
                    size="lg"
                  >
                    Active
                  </Checkbox>
                </Flex>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={4} justify="center" mt={6} mb={6}>
              <Button
                onClick={handleSubmit}
                bg="#C6D98D"
                color="black"
                _hover={{ bg: "#b2c270" }}
                width="120px"
              >
                {editing ? "Update" : "Create"}
              </Button>
              <Button
                onClick={handleCancel}
                bg="#c6d98d"
                color="black"
                _hover={{ bg: "#b2c270" }}
                width="120px"
              >
                Cancel
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default SellerManagement;
