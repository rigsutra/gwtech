import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
import {
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  useColorMode,
  VStack,
  HStack,
  Select,
  Text,
  Box,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const initConditions = [
  { gameCategory: "BLT", position: 1, condition: "" },
  { gameCategory: "BLT", position: 2, condition: "" },
  { gameCategory: "BLT", position: 3, condition: "" },
  { gameCategory: "L3C", position: 1, condition: "" },
  { gameCategory: "L4C 1", position: 1, condition: "" },
  { gameCategory: "L4C 2", position: 2, condition: "" },
  { gameCategory: "L4C 3", position: 3, condition: "" },
  { gameCategory: "L5C 1", position: 1, condition: "" },
  { gameCategory: "L5C 2", position: 2, condition: "" },
  { gameCategory: "L5C 3", position: 3, condition: "" },
  { gameCategory: "MRG", position: 1, condition: "" },
  { gameCategory: "MRG", position: 2, condition: "" },
  { gameCategory: "MRG", position: 3, condition: "" },
  { gameCategory: "MRG", position: 4, condition: "" },
  { gameCategory: "MRG", position: 5, condition: "" },
  { gameCategory: "MRG", position: 6, condition: "" },
];

const PaymentCondition = () => {
  const [editing, setEditing] = useState(false);
  const [currentCondition, setCurrentCondition] = useState(null);
  const [paymentConditions, setPaymentConditions] = useState([]);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [conditions, setConditions] = useState(initConditions);
  const [allConditions, setAllConditions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          lotteryResponse,
          sellersResponse,
          supervisorsResponse,
        ] = await Promise.all([
          api().get("/admin/getlotterycategory"),
          api().get("/subadmin/getseller"),
          api().get("/subadmin/getsuperVisor"),
        ]);
        setLotteryCategories(lotteryResponse?.data?.data || []);
        setSupervisors(supervisorsResponse?.data || []);
        setSellers(sellersResponse?.data?.users || []);
      } catch (error) {
        toast({
          title: "Error fetching initial data",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    // Removed automatic fetching
    // Now, users must click the search button to fetch data
    setAllConditions([]); // Clear existing conditions when view changes
  }, [activeView]);

  const fetchPaymentConditions = async () => {
    setIsLoading(true);
    try {
      let response;
      if (activeView === "all") {
        response = await api().get("/subadmin/getpaymenttermAll", {
          params: {
            fromDate: selectedDate,
          },
        });
      } else if (activeView === "supervisor") {
        response = await api().get("/subadmin/getpaymenttermSuperVisor", {
          params: {
            superVisor: selectedSupervisorId,
            lotteryCategoryName,
            fromDate: selectedDate,
          },
        });
      } else if (activeView === "seller") {
        response = await api().get("/subadmin/getpaymenttermSeller", {
          params: {
            seller: selectedSellerId,
            lotteryCategoryName,
            fromDate: selectedDate,
          },
        });
      }
      setAllConditions(response?.data || []);
      console.log(response?.data);
    } catch (error) {
      toast({
        title: "Error fetching payment conditions",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAllConditions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPaymentCondition = (viewType) => {
    setActiveView(viewType);
    setSelectedSellerId("");
    setSelectedSupervisorId("");
    setLotteryCategoryName("");
    setSelectedDate(new Date().toISOString().split("T")[0]); // Reset to today's date
  };

  const handleSearch = async () => {
    // Validate required fields based on activeView
    if (activeView === "supervisor" && !selectedSupervisorId) {
      toast({
        title: "Please select a supervisor.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (activeView === "seller" && !selectedSellerId) {
      toast({
        title: "Please select a seller.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetchPaymentConditions();
  };

  const handleNumberChange = (index, value) => {
    const updatedConditions = conditions.map((condition, idx) =>
      idx === index ? { ...condition, condition: value } : condition
    );
    setConditions(updatedConditions);
  };

  const handleCancel = () => {
    setEditing(false);
    onClose();
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    editing ? await handleUpdate(currentCondition?._id) : await handleCreate();
  };

  const resetForm = () => {
    setLotteryCategoryName("");
    setConditions(initConditions);
    setSelectedSeller("");
    setSelectedSupervisor("");
    setEditing(false);
    onClose();
  };

  const showError = (message) => {
    toast({
      title: message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleCreate = async () => {
    try {
      const data = {
        lotteryCategoryName: lotteryCategoryName.trim(),
        conditions,
      };
      if (activeView === "supervisor") {
        data.superVisor = selectedSupervisor;
      } else if (activeView === "seller") {
        data.seller = selectedSeller;
      }
      const response = await api().post("/subadmin/addpaymentterm", data);
      resetForm();
      setAllConditions([...allConditions, response.data]);
      toast({
        title: "Payment condition created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      showError(
        error.response?.data?.message || "Error creating payment condition"
      );
    }
  };

  const handleUpdate = async (id) => {
    try {
      const data = {
        lotteryCategoryName: lotteryCategoryName.trim(),
        conditions,
      };
      if (activeView === "supervisor") {
        data.superVisor = selectedSupervisor;
      } else if (activeView === "seller") {
        data.seller = selectedSeller;
      }
      await api().patch(`/subadmin/updatepaymentterm/${id}`, data);
      resetForm();
      const index = allConditions.findIndex(
        (condition) => condition._id === id
      );
      const newConditions = [...allConditions];
      newConditions[index] = {
        ...currentCondition,
        ...data,
      };
      setAllConditions([...newConditions]);
      toast({
        title: "Payment condition updated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating payment condition",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (condition) => {
    if (condition) {
      setEditing(true);
      setLotteryCategoryName(condition.lotteryCategoryName);
      setConditions(condition.conditions);
      setCurrentCondition(condition);
      if (condition.seller) {
        setSelectedSeller(condition.seller._id);
        setActiveView("seller");
      } else if (condition.superVisor) {
        setSelectedSupervisor(condition.superVisor._id);
        setActiveView("supervisor");
      } else {
        setActiveView("all");
      }
      onOpen();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this condition?")) {
      try {
        await api().delete(`/subadmin/deletepaymentterm/${id}`);
        setAllConditions(
          allConditions.filter((condition) => condition._id !== id)
        );
        toast({
          title: "Payment condition deleted",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        showError(
          error.response?.data?.message || "Error deleting payment condition"
        );
      }
    }
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card>
        <CardHeader
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={4}
        >
          <Text fontSize="lg" fontWeight="bold">
            Payment Conditions
          </Text>
          <RadioGroup
            onChange={handleGetPaymentCondition}
            value={activeView}
            display="flex"
            gap={4}
          >
            <Radio value="all" colorScheme="blue" size="lg">
              All
            </Radio>
            <Radio value="supervisor" colorScheme="blue" size="lg">
              Supervisor
            </Radio>
            <Radio value="seller" colorScheme="blue" size="lg">
              Seller
            </Radio>
          </RadioGroup>
          <Button
            onClick={() => {
              setEditing(false);
              onOpen();
            }}
            bg="green.800"
            color="white"
          >
            <FaPlus />
          </Button>
        </CardHeader>
        <CardHeader
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          gap={5}
          marginY="20px"
          justifyContent="center"
        >
          <HStack flexWrap="wrap" width="60%" spacing={4}>
            {/* Conditional Supervisor/Seller Select */}
            {activeView !== "all" && (
              <FormControl flex="1">
                <FormLabel>
                  {activeView === "seller" ? "Seller" : "Supervisor"}
                </FormLabel>
                <Select
                  value={
                    activeView === "seller"
                      ? selectedSellerId
                      : selectedSupervisorId
                  }
                  onChange={(e) =>
                    activeView === "seller"
                      ? setSelectedSellerId(e.target.value)
                      : setSelectedSupervisorId(e.target.value)
                  }
                >
                  <option value="">
                    {activeView === "seller"
                      ? "Select Seller"
                      : "Select SuperVisor"}
                  </option>
                  {(activeView === "seller" ? sellers : supervisors).map(
                    (person) => (
                      <option key={person._id} value={person._id}>
                        {person.userName}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
            )}

            {/* Lottery Category Select */}
            <FormControl flex="1">
              <FormLabel>Category Name</FormLabel>
              <Select
                value={lotteryCategoryName}
                onChange={(e) => setLotteryCategoryName(e.target.value)}
              >
                <option value="">All</option>
                {lotteryCategories.map((category) => (
                  <option key={category._id} value={category.lotteryName}>
                    {category.lotteryName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <HStack flexWrap="wrap" width="350px">
              {/* Date Input */}
              <FormControl flex="1" width="250px">
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </FormControl>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                bg="blue.600"
                color="white"
                isLoading={isLoading}
                alignSelf="flex-end"
                leftIcon={<CgSearch />}
                mt={{ base: "10px", md: "0" }}
              >
                Search
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <Flex wrap="wrap" justify="center" gap={4}>
            {allConditions.map((condition) => (
              <VStack
                key={condition._id}
                border="1px solid gray"
                p={4}
                w={{ base: "100%", md: "350px" }}
                borderRadius="md"
                boxShadow="sm"
              >
                <HStack spacing={20} w="100%" justify="space-between">
                  <VStack align="start">
                    <FormLabel>
                      {condition.seller?.userName ||
                        condition.superVisor?.userName ||
                        "All"}
                    </FormLabel>
                    <FormLabel>{condition.lotteryCategoryName}</FormLabel>
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      onClick={() => handleEdit(condition)}
                      bg="yellow.800"
                      color="white"
                      size="sm"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      onClick={() => handleDelete(condition._id)}
                      bg="red.800"
                      color="white"
                      size="sm"
                    >
                      <RiDeleteBinLine />
                    </Button>
                  </HStack>
                </HStack>
                <Flex wrap="wrap" gap={2} w="full">
                  {condition.conditions.map((condItem, index) => (
                    <Box key={index} w="45%">
                      <FormLabel fontSize="sm">
                        {condItem.gameCategory} {condItem.position}
                      </FormLabel>
                      <Input
                        value={condItem.condition}
                        isReadOnly
                        size="sm"
                        bg="gray.100"
                      />
                    </Box>
                  ))}
                </Flex>
              </VStack>
            ))}
          </Flex>
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} onClose={handleCancel}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl id="lotteryCategoryName" isRequired>
              <FormLabel>Lottery Category Name</FormLabel>
              <Select
                onChange={(event) => setLotteryCategoryName(event.target.value)}
                value={lotteryCategoryName}
              >
                  <option>All</option>
                {lotteryCategories.map((category) => (
                  <option key={category._id} value={category.lotteryName}>
                    {category.lotteryName}
                  </option>
                ))}
              </Select>
            </FormControl>
            {activeView === "supervisor" && (
              <FormControl isRequired>
                <FormLabel>Supervisor</FormLabel>
                <Select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  placeholder="Select Supervisor"
                >
                  {supervisors.map((supervisor) => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.userName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            {activeView === "seller" && (
              <FormControl isRequired>
                <FormLabel>Seller</FormLabel>
                <Select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  placeholder="Select Seller"
                >
                  {sellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.userName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl id="Conditions" isRequired>
              <FormLabel>Payment Conditions</FormLabel>
              <Stack p="5px">
                <Flex justifyContent="space-between">
                  <VStack
                    mx="3px"
                    flexBasis={{ base: "100%", md: "50%" }}
                    color="black"
                  >
                    {/* First Half of Conditions */}
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        1st (First)
                      </FormLabel>
                      <Input
                        placeholder="First"
                        value={conditions[0].condition}
                        onChange={(event) =>
                          handleNumberChange(0, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        2nd (Second)
                      </FormLabel>
                      <Input
                        placeholder="Second"
                        value={conditions[1].condition}
                        onChange={(event) =>
                          handleNumberChange(1, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        3rd (Third)
                      </FormLabel>
                      <Input
                        placeholder="Third"
                        value={conditions[2].condition}
                        onChange={(event) =>
                          handleNumberChange(2, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L3C
                      </FormLabel>
                      <Input
                        placeholder="L3C"
                        value={conditions[3].condition}
                        onChange={(event) =>
                          handleNumberChange(3, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        MRG
                      </FormLabel>
                      <Input
                        placeholder="Enter MRG value"
                        value={conditions[10].condition} // Display the value from the first MRG position
                        onChange={(event) => {
                          const value = event.target.value;
                          const updatedConditions = conditions.map(
                            (condition, index) => {
                              // Update only MRG positions (10 to 15)
                              if (index >= 10 && index <= 15) {
                                return { ...condition, condition: value };
                              }
                              return condition;
                            }
                          );
                          setConditions(updatedConditions);
                        }}
                        type="number"
                      />
                    </Box>
                  </VStack>
                  <VStack
                    mx="3px"
                    flexBasis={{ base: "100%", md: "50%" }}
                    color="black"
                  >
                    {/* Second Half of Conditions */}
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L4C1
                      </FormLabel>
                      <Input
                        placeholder="L4C1"
                        value={conditions[4].condition}
                        onChange={(event) =>
                          handleNumberChange(4, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L4C2
                      </FormLabel>
                      <Input
                        placeholder="L4C2"
                        value={conditions[5].condition}
                        onChange={(event) =>
                          handleNumberChange(5, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L4C3
                      </FormLabel>
                      <Input
                        placeholder="L4C3"
                        value={conditions[6].condition}
                        onChange={(event) =>
                          handleNumberChange(6, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L5C1
                      </FormLabel>
                      <Input
                        placeholder="L5C1"
                        value={conditions[7].condition}
                        onChange={(event) =>
                          handleNumberChange(7, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L5C2
                      </FormLabel>
                      <Input
                        placeholder="L5C2"
                        value={conditions[8].condition}
                        onChange={(event) =>
                          handleNumberChange(8, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize={14} mb="0" mx="2px">
                        L5C3
                      </FormLabel>
                      <Input
                        placeholder="L5C3"
                        value={conditions[9].condition}
                        onChange={(event) =>
                          handleNumberChange(9, event.target.value)
                        }
                        type="number"
                      />
                    </Box>
                  </VStack>
                </Flex>
              </Stack>
            </FormControl>
          </VStack>
          <Button type="submit" mt={4} colorScheme="blue">
            {editing ? "Update" : "Add"} Payment Condition
          </Button>
        </form>
      </Modal>
    </Flex>
  );
};

export default PaymentCondition;
