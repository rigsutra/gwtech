import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const initConditions = [
  { gameCategory: "L3C", limitPercent: "" },
  { gameCategory: "L4C 1", limitPercent: "" },
  { gameCategory: "L4C 2", limitPercent: "" },
  { gameCategory: "L4C 3", limitPercent: "" },
  { gameCategory: "L5C 1", limitPercent: "" },
  { gameCategory: "L5C 2", limitPercent: "" },
  { gameCategory: "L5C 3", limitPercent: "" },
  { gameCategory: "MRG", limitPercent: "" },
];

const PercentageLimit = () => {
  const [editing, setEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [conditions, setConditions] = useState(initConditions);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [allConditions, setAllConditions] = useState([]);
  const [currentCondition, setCurrentCondition] = useState();

  useEffect(() => {
    if (lotteryCategoryName) setConditions(initConditions);
  }, [lotteryCategoryName]);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategories(response?.data?.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching lottery categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchLotteryCategories();
  }, []);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const response = await api().get("/subadmin/getpercentagelimit");
        setAllConditions(response.data);
      } catch (error) {
        console.error(
          "Error fetching conditions:",
          error?.response?.data?.message || error.message
        );
        toast({
          title: "Error fetching Payment Condition",
          description: error?.response?.data?.message || "Server error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchConditions();
  }, []);

  const handleNumberChange = (index, value) => {
    const updatedConditions = conditions.map((condition, idx) =>
      idx === index ? { ...condition, limitPercent: value } : condition
    );
    setConditions(updatedConditions);
  };

  const handleCancel = () => {
    setEditing(false);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    editing ? handleUpdate(currentCondition._id) : handleCreate();
  };

  const resetForm = () => {
    setLotteryCategoryName("");
    setConditions(initConditions);
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
      const response = await api().post("/subadmin/addpercentagelimit", {
        lotteryCategoryName: lotteryCategoryName,
        limits: conditions,
      });
      resetForm();
      setAllConditions([...allConditions, response.data]);
      toast({
        title: "Payment condition created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      showError("Error creating payment condition");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await api().patch(
        `/subadmin/updatepercentagelimit/${id}`,
        {
          lotteryCategoryName: lotteryCategoryName,
          limits: conditions,
        }
      );
      setAllConditions((prevConditions) =>
        prevConditions.map((cond) => (cond._id === id ? response.data : cond))
      );
      resetForm();
      toast({
        title: "Payment condition updated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating payment condition",
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
      setConditions(condition.limits);
      setCurrentCondition(condition);
      onOpen();
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this condition?"
    );
    if (!isConfirmed) return;

    try {
      await api()
        .delete(`/subadmin/deletepercentagelimit/${id}`)
        .then(() => {
          setAllConditions(
            allConditions.filter((condition) => condition._id !== id)
          );
        });
      toast({
        title: "Payment condition deleted",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      showError(
        error.response?.data?.error || "Error deleting payment condition"
      );
    }
  };

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      width="100%"
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Card
        overflowX="auto"
        borderRadius={"none"}
        p={{ base: "10px", md: "20px" }}
        width={{ base: "100%", md: "80%", lg: "60%" }} // Responsive width
        maxWidth="1200px"
        border={{ base: "none", md: "1px solid gray" }}
      >
        <CardHeader display="flex" justifyContent="space-between">
          <Text fontSize="lg" color="black" font="Weight:bold">
            Percentage Limit
          </Text>
          <Button
            size="md"
            onClick={() => {
              if (lotteryCategories.length > 0) {
                setLotteryCategoryName(lotteryCategories[0]?.lotteryName);
                onOpen();
              }
            }}
            isDisabled={lotteryCategories.length === 0}
            bg={colorMode === "light" ? "blue.500" : "blue.300"}
            _hover={{ bg: colorMode === "light" ? "blue.600" : "blue.200" }}
            borderRadius={"none"}
          >
            <FaPlus size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody pb="15px" mt="15px">
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            {allConditions?.map((condition, index) => (
              <Stack
                key={index}
                spacing={1}
                width="350px"
                p="5px"
                m="10px"
                border={"1px solid gray"}
              >
                <VStack spacing={3} align="stretch" color="black">
                  <FormControl id="lotteryCategoryName" isRequired>
                    <HStack justifyContent="space-between">
                      <Box>
                        <FormLabel>Lottery Category Name</FormLabel>
                        <FormLabel>{condition.lotteryCategoryName}</FormLabel>
                      </Box>
                      <Box as="div">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(condition._id)}
                          bg={
                            colorMode === "light" ? "yellow.500" : "yellow.300"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "yellow.600"
                                : "yellow.200",
                          }}
                          borderRadius={"none"}
                        >
                          <FaEdit size={20} color="white" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(condition)}
                          bg={colorMode === "light" ? "red.500" : "red.300"}
                          _hover={{
                            bg: colorMode === "light" ? "red.600" : "red.200",
                          }}
                          borderRadius={"none"}
                          ml={2}
                        >
                          <RiDeleteBinLine size={20} color="white" />
                        </Button>
                      </Box>
                    </HStack>
                  </FormControl>
                  <FormControl id="conditions" isRequired>
                    <FormLabel>Percentage Limit</FormLabel>
                    <Stack>
                      <Flex justifyContent="space-between">
                        <VStack color="black">
                          <Box>
                            <FormLabel fontSize={14}>L3C</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[0].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>MRG</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[7].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>L4C1</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[1].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>L4C2</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[2].limitPercent}
                            />
                          </Box>
                        </VStack>
                        <VStack color="black">
                          <Box>
                            <FormLabel fontSize={14}>L4C3</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[3].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>L5C1</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[4].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>L5C2</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[5].limitPercent}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14}>L5C3</FormLabel>
                            <Input
                              isReadOnly
                              value={condition.limits[4].limitPercent}
                            />
                          </Box>
                        </VStack>
                      </Flex>
                    </Stack>
                  </FormControl>
                </VStack>
              </Stack>
            ))}
          </Flex>
        </CardBody>
      </Card>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Condition" : "Create Condition"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
      >
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl id="lotteryCategoryName" isRequired>
              <FormLabel>Lottery Category Name</FormLabel>
              <Select
                value={lotteryCategoryName}
                onChange={(event) => setLotteryCategoryName(event.target.value)}
              >
                {lotteryCategories.map((category) => (
                  <option key={category._id} value={category.lotteryName}>
                    {category.lotteryName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl id="Conditions" isRequired>
              <FormLabel>Payment Conditions</FormLabel>
              <Flex justifyContent="space-between">
                <VStack color="black">
                  {conditions.map((condition, index) => (
                    <Box key={index}>
                      <FormLabel fontSize={14}>
                        {condition.gameCategory}
                      </FormLabel>
                      <Input
                        value={condition.limitPercent}
                        onChange={(e) =>
                          handleNumberChange(index, e.target.value)
                        }
                        type="number"
                      />
                    </Box>
                  ))}
                </VStack>
              </Flex>
            </FormControl>
          </VStack>
        </form>
      </Modal>
    </Flex>
  );
};

export default PercentageLimit;
