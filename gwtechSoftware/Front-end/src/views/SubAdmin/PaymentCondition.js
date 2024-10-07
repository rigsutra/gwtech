import { useState, useEffect, Fragment } from "react";
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

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const initConditions = [
  {
    gameCategory: "BLT",
    position: 1,
    condition: "",
  },
  {
    gameCategory: "BLT",
    position: 2,
    condition: "",
  },
  {
    gameCategory: "BLT",
    position: 3,
    condition: "",
  },
  {
    gameCategory: "L3C",
    position: 1,
    condition: "",
  },
  {
    gameCategory: "L4C 1",
    position: 1,
    condition: "",
  },
  {
    gameCategory: "L4C 2",
    position: 2,
    condition: "",
  },
  {
    gameCategory: "L4C 3",
    position: 3,
    condition: "",
  },
  {
    gameCategory: "L5C 1",
    position: 1,
    condition: "",
  },
  {
    gameCategory: "L5C 2",
    position: 2,
    condition: "",
  },
  {
    gameCategory: "L5C 3",
    position: 3,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 1,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 2,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 3,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 4,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 5,
    condition: "",
  },
  {
    gameCategory: "MRG",
    position: 6,
    condition: "",
  },
];

const PaymentCondition = () => {
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
    if (lotteryCategoryName) {
      setConditions(initConditions);
    }
  }, [lotteryCategoryName]);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategories(response.data.data);
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
        const response = await api().get("/subadmin/getpaymentterm");
        setAllConditions(response.data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching Payment Condition",
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
      idx === index ? { ...condition, condition: value } : condition
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
      const response = await api().post("/subadmin/addpaymentterm", {
        lotteryCategoryName: lotteryCategoryName.trim(),
        conditions,
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
      await api().patch(`/subadmin/updatepaymentterm/${id}`, {
        lotteryCategoryName: lotteryCategoryName.trim(),
        conditions: conditions,
      });
      setLotteryCategoryName("");
      setConditions(initConditions);
      setEditing(false);
      onClose();
      const index = allConditions.findIndex(
        (condition) => condition._id === id
      );
      const newConditions = [...allConditions];
      newConditions[index] = {
        _id: id,
        lotteryCategoryName,
        conditions: conditions,
      };
      setAllConditions([...newConditions]);
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
    setEditing(true);
    setLotteryCategoryName(condition?.lotteryCategoryName);
    setConditions(condition?.conditions);
    setCurrentCondition(condition);
    onOpen();
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
        console.error(error);
        showError("Error deleting payment condition");
      }
    }
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card
        overflowX={{ md: "scroll", xl: "hidden" }}
        p={{ base: "5px", md: "20px" }}
        width="100%"
        border={{ base: "none", md: "1px solid gray" }}
      >
        <CardHeader
          p="6px 0px 22px 0px"
          display="flex"
          justifyContent="space-between"
        >
          <Text fontSize="lg" color="black" font="Weight:bold">
            Payment Condition
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
          >
            <FaPlus size={24} color="white" />
          </Button>
        </CardHeader>
        <CardBody pb="15px">
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
                borderRadius="3px"
                p="5px"
                m="10px"
                border={"1px solid gray"}
                boxShadow="0px 0px 2px white"
              >
                <VStack spacing={3} align="stretch" color="black">
                  <FormControl id="lotteryCategoryName" isRequired>
                    <HStack justifyContent="space-between">
                      <Box>
                        <FormLabel>Lottery Category Name</FormLabel>
                        <FormLabel>{condition.lotteryCategoryName}</FormLabel>
                      </Box>
                      <Box>
                        <Button
                          size="sm"
                          mr={2}
                          onClick={() => handleEdit(condition)}
                          bg={
                            colorMode === "light" ? "yellow.500" : "yellow.300"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "yellow.600"
                                : "yellow.200",
                          }}
                        >
                          <FaEdit size={20} color="white" />
                        </Button>
                        {/* <Button
                          size="sm"
                          onClick={() => handleDelete(condition?._id)}
                          bg={colorMode === "light" ? "red.500" : "red.300"}
                          _hover={{
                            bg: colorMode === "light" ? "red.600" : "red.200",
                          }}
                        >
                          <RiDeleteBinLine size={20} color="white" />
                        </Button> */}
                      </Box>
                    </HStack>
                  </FormControl>
                  <FormControl id="conditions" isRequired>
                    <FormLabel>Payment Condition</FormLabel>
                    <Stack p="5px">
                      <Flex
                        // flexWrap="wrap"
                        // flexDirection={{ base: "column", md: "row" }}
                        justifyContent="space-between"
                      >
                        <VStack
                          mx="3px"
                          flexBasis={{ base: "100%", md: "50%" }}
                          color="black"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              1st (First)
                            </FormLabel>
                            <Input
                              placeholder="First"
                              maxLength={2}
                              isReadOnly={true}
                              value={condition.conditions[0].condition}
                              onChange={(event) =>
                                handleNumberChange(0, 0, event.target.value)
                              }
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              2nd (Second)
                            </FormLabel>
                            <Input
                              placeholder="Second"
                              maxLength={2}
                              isReadOnly={true}
                              value={condition.conditions[1].condition}
                              onChange={(event) =>
                                handleNumberChange(0, 1, event.target.value)
                              }
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              3rd (Third)
                            </FormLabel>
                            <Input
                              placeholder="Third"
                              maxLength={2}
                              isReadOnly={true}
                              value={condition.conditions[2].condition}
                              onChange={(event) =>
                                handleNumberChange(0, 2, event.target.value)
                              }
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L3C
                            </FormLabel>
                            <Input
                              placeholder="L3C"
                              maxLength={3}
                              isReadOnly={true}
                              value={condition.conditions[3].condition}
                              onChange={(event) =>
                                handleNumberChange(1, 0, event.target.value)
                              }
                            />
                          </Box>
                        </VStack>

                        <VStack
                          mx="3px"
                          flexBasis={{ base: "100%", md: "50%" }}
                          color="black"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C1
                            </FormLabel>
                            <Input
                              placeholder="L4C1"
                              isReadOnly={true}
                              value={condition.conditions[4].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C2
                            </FormLabel>
                            <Input
                              placeholder="L4C2"
                              isReadOnly={true}
                              value={condition.conditions[4].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C3
                            </FormLabel>
                            <Input
                              placeholder="L4C3"
                              isReadOnly={true}
                              value={condition.conditions[4].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L5C1
                            </FormLabel>
                            <Input
                              placeholder="L5C1"
                              isReadOnly={true}
                              value={condition.conditions[7].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L5C2
                            </FormLabel>
                            <Input
                              placeholder="L5C2"
                              isReadOnly={true}
                              value={condition.conditions[7].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L5C3
                            </FormLabel>
                            <Input
                              placeholder="L5C3"
                              isReadOnly={true}
                              value={condition.conditions[7].condition}
                            />
                          </Box>

                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG
                            </FormLabel>
                            <Input
                              placeholder="MRG"
                              isReadOnly={true}
                              value={condition.conditions[10].condition}
                              type="number"
                            />
                          </Box>

                          {/* <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG1
                            </FormLabel>
                            <Input
                              placeholder="MRG1"
                              isReadOnly={true}
                              value={condition.conditions[9].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG2
                            </FormLabel>
                            <Input
                              placeholder="MRG2"
                              isReadOnly={true}
                              value={condition.conditions[10].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG3
                            </FormLabel>
                            <Input
                              placeholder="MRG3"
                              isReadOnly={true}
                              value={condition.conditions[11].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG4
                            </FormLabel>
                            <Input
                              placeholder="MRG4"
                              isReadOnly={true}
                              value={condition.conditions[12].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG5
                            </FormLabel>
                            <Input
                              placeholder="MRG5"
                              isReadOnly={true}
                              value={condition.conditions[13].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              MRG6
                            </FormLabel>
                            <Input
                              placeholder="MRG5"
                              isReadOnly={true}
                              value={condition.conditions[14].condition}
                            />
                          </Box> */}
                        </VStack>

                        {/* <VStack
                          mx="3px"
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                        >
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C1
                            </FormLabel>
                            <Input
                              placeholder="L4C1"
                              isReadOnly={true}
                              value={condition.conditions[4].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C2
                            </FormLabel>
                            <Input
                              placeholder="L4C2"
                              isReadOnly={true}
                              value={condition.conditions[5].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L4C3
                            </FormLabel>
                            <Input
                              placeholder="L4C3"
                              isReadOnly={true}
                              value={condition.conditions[6].condition}
                            />
                          </Box>

                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L5C1
                            </FormLabel>
                            <Input
                              placeholder="L5C1"
                              isReadOnly={true}
                              value={condition.conditions[7].condition}
                            />
                          </Box>
                          <Box>
                            <FormLabel fontSize={14} mb="0" mx="2px">
                              L5C2
                            </FormLabel>
                            <Input
                              placeholder="L5C2"
                              isReadOnly={true}
                              value={condition.conditions[8].condition}
                            />
                          </Box>
                        </VStack> */}
                      </Flex>
                    </Stack>
                  </FormControl>
                </VStack>
              </Stack>
            ))}
          </Flex>
        </CardBody>
      </Card>
      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Condition" : "Create Condition"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
      >
        <Stack spacing={4}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl id="lotteryCategoryName" isRequired>
                <FormLabel>Lottery Category Name</FormLabel>
                <Select
                  onChange={(event) =>
                    setLotteryCategoryName(event.target.value)
                  }
                  defaultValue={lotteryCategoryName}
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
                <Stack p="5px">
                  <Flex
                    // flexWrap="wrap"
                    // flexDirection={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                  >
                    <VStack
                      mx="3px"
                      flexBasis={{ base: "100%", md: "50%" }}
                      color="black"
                    >
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
                    </VStack>

                    <VStack
                      mx="3px"
                      flexBasis={{ base: "100%", md: "50%" }}
                      color="black"
                    >
                      {/* <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          L4C
                        </FormLabel>
                        <Input
                          placeholder="L4C"
                          value={conditions[4].condition}
                          onChange={(event) => {
                            handleNumberChange(4, event.target.value);
                            handleNumberChange(5, event.target.value);
                            handleNumberChange(6, event.target.value);
                          }}
                          type="number"
                        />
                      </Box>

                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          L5C
                        </FormLabel>
                        <Input
                          placeholder="L5C"
                          value={conditions[7].condition}
                          onChange={(event) => {
                            handleNumberChange(7, event.target.value);
                            handleNumberChange(8, event.target.value);
                            handleNumberChange(9, event.target.value);
                          }}
                          type="number"
                        />
                      </Box> */}

                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG
                        </FormLabel>
                        <Input
                          placeholder="MRG"
                          value={conditions[10].condition}
                          onChange={(event) => {
                            handleNumberChange(10, event.target.value);
                            handleNumberChange(11, event.target.value);
                            handleNumberChange(12, event.target.value);
                            handleNumberChange(13, event.target.value);
                            handleNumberChange(14, event.target.value);
                            handleNumberChange(15, event.target.value);
                          }}
                          type="number"
                        />
                      </Box>
                      {/* <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG1
                        </FormLabel>
                        <Input
                          placeholder="MRG1"
                          value={conditions[9].condition}
                          onChange={(event) =>
                            handleNumberChange(9, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG1
                        </FormLabel>
                        <Input
                          placeholder="MRG1"
                          value={conditions[9].condition}
                          onChange={(event) =>
                            handleNumberChange(9, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG2
                        </FormLabel>
                        <Input
                          placeholder="MRG2"
                          value={conditions[10].condition}
                          onChange={(event) =>
                            handleNumberChange(10, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG3
                        </FormLabel>
                        <Input
                          placeholder="MRG3"
                          value={conditions[11].condition}
                          onChange={(event) =>
                            handleNumberChange(11, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG4
                        </FormLabel>
                        <Input
                          placeholder="MRG4"
                          value={conditions[12].condition}
                          onChange={(event) =>
                            handleNumberChange(12, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG5
                        </FormLabel>
                        <Input
                          placeholder="MRG5"
                          value={conditions[13].condition}
                          onChange={(event) =>
                            handleNumberChange(13, event.target.value)
                          }
                          type="number"
                        />
                      </Box>
                      <Box>
                        <FormLabel fontSize={14} mb="0" mx="2px">
                          MRG6
                        </FormLabel>
                        <Input
                          placeholder="MRG5"
                          value={conditions[14].condition}
                          onChange={(event) =>
                            handleNumberChange(14, event.target.value)
                          }
                          type="number"
                        />
                      </Box> */}
                    </VStack>

                    <VStack
                      mx="3px"
                      flexBasis={{ base: "100%", md: "30%" }}
                      color="black"
                    >
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
                          placeholder="L5C2"
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
          </form>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default PaymentCondition;
