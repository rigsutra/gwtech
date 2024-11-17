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

import { CgSearch } from "react-icons/cg";
import { FaPlus, FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const initWinNumbers = [
  { gameCategory: "BLT", position: 1, number: "" }, // BLT1 - First
  { gameCategory: "BLT", position: 2, number: "" }, // BLT2 - Second
  { gameCategory: "BLT", position: 3, number: "" }, // BLT3 - Third
  { gameCategory: "L3C", position: 1, number: "" }, // L3C1
  { gameCategory: "L4C 1", position: 1, number: "" }, // L4C1
  { gameCategory: "L4C 2", position: 1, number: "" }, // L4C2
  { gameCategory: "L4C 3", position: 1, number: "" }, // L4C3
  { gameCategory: "L5C 1", position: 1, number: "" }, // L5C1
  { gameCategory: "L5C 2", position: 1, number: "" }, // L5C2
  { gameCategory: "L5C 3", position: 1, number: "" }, // L5C3
  { gameCategory: "MRG", position: 1, number: "" }, // MRG1
  { gameCategory: "MRG", position: 2, number: "" }, // MRG2
  { gameCategory: "MRG", position: 3, number: "" }, // MRG3
  { gameCategory: "MRG", position: 4, number: "" }, // MRG4
  { gameCategory: "MRG", position: 5, number: "" }, // MRG5
  { gameCategory: "MRG", position: 6, number: "" }, // MRG6
];

const WinningNumbersManagement = () => {
  const [editing, setEditing] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] // "en-CA" format YYYY-MM-DD
  );
  const [numbers, setNumbers] = useState(
    JSON.parse(JSON.stringify(initWinNumbers))
  );
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [currentWinNumber, setCurrentWinNumber] = useState(null);
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  // Track which fields have been manually overridden
  const [manualOverrides, setManualOverrides] = useState({});

  useEffect(() => {
    setNumbers(JSON.parse(JSON.stringify(initWinNumbers)));
    setManualOverrides({});
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
  }, [toast]);

  const fetchWinningNumbers = async () => {
    try {
      const response = await api().post("/admin/getwiningnumber", {
        lotteryCategoryName: "", // Assuming empty to fetch all
        fromDate,
        toDate,
      });
      setWinningNumbers(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching winning numbers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNumberChange = (index, value) => {
    // Optionally, validate input here (e.g., numeric, length)
    setNumbers((prevNumbers) => {
      const newNumbers = [...prevNumbers];
      newNumbers[index].number = value;

      // Update manual overrides if the field is editable
      if (
        ["L4C 1", "L4C 2", "L4C 3", "L5C 1", "L5C 2", "L5C 3"].includes(
          newNumbers[index].gameCategory
        )
      ) {
        setManualOverrides((prev) => ({
          ...prev,
          [index]: true,
        }));
      }

      // If main numbers change, recalculate dependent fields unless manually overridden
      if ([0, 1, 2, 3].includes(index)) {
        // Recalculate L4C
        if (!manualOverrides[4]) {
          newNumbers[4].number = `${newNumbers[1].number}${newNumbers[2].number}`; // L4C1
        }
        if (!manualOverrides[5]) {
          newNumbers[5].number = `${newNumbers[0].number}${newNumbers[1].number}`; // L4C2
        }
        if (!manualOverrides[6]) {
          newNumbers[6].number = `${newNumbers[0].number}${newNumbers[2].number}`; // L4C3

          // Recalculate L5C
        }
        if (!manualOverrides[7]) {
          newNumbers[7].number = `${newNumbers[3].number}${newNumbers[2].number}`; // L5C1
        }
        if (!manualOverrides[8]) {
          newNumbers[8].number = `${newNumbers[3].number}${newNumbers[1].number}`; // L5C2
        }
        if (!manualOverrides[9]) {
          newNumbers[9].number = `${newNumbers[3].number}${newNumbers[0].number}`; // L5C3
        }

        // Recalculate MRG fields regardless of manual overrides (you can adjust if needed)
        newNumbers[10].number = `${newNumbers[0].number}×${newNumbers[1].number}`; // MRG1
        newNumbers[11].number = `${newNumbers[0].number}×${newNumbers[2].number}`; // MRG2
        newNumbers[12].number = `${newNumbers[1].number}×${newNumbers[2].number}`; // MRG3
        // newNumbers[13].number = `${newNumbers[1].number}×${newNumbers[0].number}`; // MRG4
        // newNumbers[14].number = `${newNumbers[2].number}×${newNumbers[0].number}`; // MRG5
        // newNumbers[15].number = `${newNumbers[2].number}×${newNumbers[1].number}`; // MRG6
      }

      return newNumbers;
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setNumbers(JSON.parse(JSON.stringify(initWinNumbers)));
    setManualOverrides({});
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editing) {
      handleUpdate(currentWinNumber._id);
    } else {
      try {
        const response = await api().post("/admin/addwiningnumber", {
          lotteryCategoryName: lotteryCategoryName.trim(),
          date,
          numbers: numbers,
        });
        setLotteryCategoryName("");
        setDate(new Date().toISOString().split("T")[0]);
        setNumbers(JSON.parse(JSON.stringify(initWinNumbers)));
        setManualOverrides({});
        setEditing(false);
        onClose();

        // Check if the new winning number falls within the date range
        if (
          new Date(response.data.date) >= new Date(fromDate) &&
          new Date(response.data.date) <= new Date(toDate)
        ) {
          setWinningNumbers((prev) => [...prev, response.data]);
        }
        toast({
          title: "Winning number created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error creating winning number",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api().patch(`/admin/updatewiningnumber/${id}`, {
        lotteryCategoryName,
        date,
        numbers: numbers,
      });
      setLotteryCategoryName("");
      setDate(new Date().toISOString().split("T")[0]);
      setNumbers(JSON.parse(JSON.stringify(initWinNumbers)));
      setManualOverrides({});
      setEditing(false);
      onClose();
      const index = winningNumbers.findIndex((number) => number._id === id);
      if (index !== -1) {
        const newWinningNumbers = [...winningNumbers];
        newWinningNumbers[index] = {
          _id: id,
          lotteryCategoryName,
          date,
          numbers: numbers,
        };
        setWinningNumbers(newWinningNumbers);
      }
      toast({
        title: "Winning number updated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating winning number",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (number) => {
    setEditing(true);
    setLotteryCategoryName(number?.lotteryCategoryName);
    setDate(number?.date.substr(0, 10));
    setNumbers(number?.numbers);
    setCurrentWinNumber(number);
    setManualOverrides({});
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await api().delete(`/admin/deletewiningnumber/${id}`);
      setWinningNumbers(winningNumbers.filter((number) => number._id !== id));
      toast({
        title: "Winning number deleted",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting winning number",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const parts = dateString?.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${month}/${day}/${year}`;
      }
    } catch (err) {}
    // Return the original string if it doesn't match the expected format
    return dateString;
  };

  // Recalculate dependent numbers manually
  const recalculateDependentNumbers = () => {
    setNumbers((prevNumbers) => {
      const newNumbers = [...prevNumbers];

      // Recalculate L4C
      if (!manualOverrides[4]) {
        newNumbers[4].number = `${newNumbers[1].number}${newNumbers[2].number}`; // L4C1
      }
      if (!manualOverrides[5]) {
        newNumbers[5].number = `${newNumbers[0].number}${newNumbers[1].number}`; // L4C2
      }
      if (!manualOverrides[6]) {
        newNumbers[6].number = `${newNumbers[0].number}${newNumbers[2].number}`; // L4C3
      }

      // Recalculate L5C
      if (!manualOverrides[7]) {
        newNumbers[7].number = `${newNumbers[3].number}${newNumbers[2].number}`; // L5C1
      }
      if (!manualOverrides[8]) {
        newNumbers[8].number = `${newNumbers[3].number}${newNumbers[1].number}`; // L5C2
      }
      if (!manualOverrides[9]) {
        newNumbers[9].number = `${newNumbers[3].number}${newNumbers[0].number}`; // L5C3
      }

      // Recalculate MRG fields regardless
      newNumbers[10].number = `${newNumbers[0].number}×${newNumbers[1].number}`; // MRG1
      newNumbers[11].number = `${newNumbers[0].number}×${newNumbers[2].number}`; // MRG2
      newNumbers[12].number = `${newNumbers[1].number}×${newNumbers[2].number}`; // MRG3
      newNumbers[13].number = `${newNumbers[1].number}×${newNumbers[0].number}`; // MRG4
      newNumbers[14].number = `${newNumbers[2].number}×${newNumbers[0].number}`; // MRG5
      newNumbers[15].number = `${newNumbers[2].number}×${newNumbers[1].number}`; // MRG6

      return newNumbers;
    });
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
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
          <Flex
            flexWrap="wrap"
            flexDirection="column"
            justifyContent="flex-start"
            width="100%"
          >
            <Text fontSize="lg" fontWeight="bold">
              Winning Numbers
            </Text>
            <Flex
              flexWrap="wrap"
              justifyContent="space-start"
              alignItems={"center"}
            >
              <FormControl id="fromDate" width="320px" py="10px" isRequired>
                <HStack justifyContent="space-between">
                  <FormLabel>From</FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>
              <FormControl id="toDate" width="320px" py="10px" isRequired>
                <HStack justifyContent="space-between">
                  <FormLabel>To</FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>
              <HStack ml="10px" pt={{ md: "0px", sm: "10px" }}>
                <Button
                  size="sm"
                  onClick={fetchWinningNumbers}
                  bg={colorMode === "light" ? "red.600" : "blue.300"}
                  _hover={{
                    bg: colorMode === "light" ? "red.500" : "blue.200",
                  }}
                >
                  <CgSearch size={20} color={"white"} />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setLotteryCategoryName(
                      lotteryCategories[0]?.lotteryName || ""
                    );
                    onOpen();
                  }}
                  bg={colorMode === "light" ? "blue.500" : "blue.300"}
                  _hover={{
                    bg: colorMode === "light" ? "blue.600" : "blue.200",
                  }}
                >
                  <FaPlus size={24} color="white" />
                </Button>
              </HStack>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            {winningNumbers?.map((number, index) => (
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
                        <Text>{number?.lotteryCategoryName}</Text>
                      </Box>
                      <Box>
                        <FormLabel>Date</FormLabel>
                        <Text>{formatDate(number?.date.substr(0, 10))}</Text>
                      </Box>
                    </HStack>
                  </FormControl>
                  <Flex justifyContent={"right"}>
                    <Box>
                      <Button
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(number)}
                        bg={colorMode === "light" ? "yellow.500" : "yellow.300"}
                        _hover={{
                          bg:
                            colorMode === "light" ? "yellow.600" : "yellow.200",
                        }}
                      >
                        <FaEdit size={20} color="white" />
                      </Button>
                      {/* Uncomment the delete button if you want to enable deletion */}
                      {/* <Button
                        size="sm"
                        onClick={() => handleDelete(number?._id)}
                        bg={colorMode === "light" ? "red.500" : "red.300"}
                        _hover={{
                          bg: colorMode === "light" ? "red.600" : "red.200",
                        }}
                      >
                        <RiDeleteBinLine size={20} color="white" />
                      </Button> */}
                    </Box>
                  </Flex>
                  <FormControl id="winNumbers" isRequired>
                    <FormLabel>Win Numbers</FormLabel>
                    <Stack p="5px">
                      <Flex justifyContent="space-between">
                        {/* BLT and L3C */}
                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          {/* BLT1 - First */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              1st (First)
                            </FormLabel>
                            <Input
                              placeholder="First"
                              maxLength={2}
                              isReadOnly={true} // Assuming BLT fields are still read-only in display
                              value={number?.numbers[0]?.number}
                            />
                          </Box>
                          {/* BLT2 - Second */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              2nd (Second)
                            </FormLabel>
                            <Input
                              placeholder="Second"
                              maxLength={2}
                              isReadOnly={true}
                              value={number?.numbers[1]?.number}
                            />
                          </Box>
                          {/* BLT3 - Third */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              3rd (Third)
                            </FormLabel>
                            <Input
                              placeholder="Third"
                              maxLength={2}
                              isReadOnly={true}
                              value={number?.numbers[2]?.number}
                            />
                          </Box>
                          {/* L3C */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L3C
                            </FormLabel>
                            <Input
                              placeholder="L3C"
                              maxLength={3}
                              isReadOnly={true}
                              value={number?.numbers[3]?.number}
                            />
                          </Box>
                        </VStack>

                        {/* MRG Fields */}
                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          {/* MRG1 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG1
                            </FormLabel>
                            <Input
                              placeholder="MRG1"
                              isReadOnly={true} // Display is read-only
                              value={number?.numbers[10]?.number}
                            />
                          </Box>
                          {/* MRG2 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG2
                            </FormLabel>
                            <Input
                              placeholder="MRG2"
                              isReadOnly={true}
                              value={number?.numbers[11]?.number}
                            />
                          </Box>
                          {/* MRG3 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              MRG3
                            </FormLabel>
                            <Input
                              placeholder="MRG3"
                              isReadOnly={true}
                              value={number?.numbers[12]?.number}
                            />
                          </Box>
                          {/*MRG4 */}
                        </VStack>
                        <Box>
                          <FormLabel fontSize={14} mb="0">
                            MRG4
                          </FormLabel>
                          <Input
                            placeholder="MRG4"
                            isReadOnly={true}
                            value={number?.numbers[13]?.number}
                          />
                        </Box>
                        {/* MRG5 */}
                        <Box>
                          <FormLabel fontSize={14} mb="0">
                            MRG5
                          </FormLabel>
                          <Input
                            placeholder="MRG5"
                            isReadOnly={true}
                            value={number?.numbers[14]?.number}
                          />
                        </Box>
                        {/* MRG6 */}
                        <Box>
                          <FormLabel fontSize={14} mb="0">
                            MRG6
                          </FormLabel>
                          <Input
                            placeholder="MRG6"
                            isReadOnly={true}
                            value={number?.numbers[15]?.number}
                          />
                        </Box>

                        {/* L4C and L5C Fields */}
                        <VStack
                          flexBasis={{ base: "100%", md: "30%" }}
                          color="black"
                          mx="3px"
                        >
                          {/* L4C1 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C1
                            </FormLabel>
                            <Input
                              placeholder="L4C1"
                              isReadOnly={true}
                              value={number?.numbers[4]?.number}
                            />
                          </Box>
                          {/* L4C2 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C2
                            </FormLabel>
                            <Input
                              placeholder="L4C2"
                              isReadOnly={true}
                              value={number?.numbers[5]?.number}
                            />
                          </Box>
                          {/* L4C3 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L4C3
                            </FormLabel>
                            <Input
                              placeholder="L4C3"
                              isReadOnly={true}
                              value={number?.numbers[6]?.number}
                            />
                          </Box>

                          {/* L5C1 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C1
                            </FormLabel>
                            <Input
                              placeholder="L5C1"
                              isReadOnly={true}
                              value={number?.numbers[7]?.number}
                            />
                          </Box>
                          {/* L5C2 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C2
                            </FormLabel>
                            <Input
                              placeholder="L5C2"
                              isReadOnly={true}
                              value={number?.numbers[8]?.number}
                            />
                          </Box>
                          {/* L5C3 */}
                          <Box>
                            <FormLabel fontSize={14} mb="0">
                              L5C3
                            </FormLabel>
                            <Input
                              placeholder="L5C3"
                              isReadOnly={true}
                              value={number?.numbers[9]?.number}
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
      {/* Create/Edit Number Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={editing ? "Edit Winning Number" : "Create Winning Number"}
        submitButtonText={editing ? "Update" : "Create"}
        onSubmit={handleSubmit}
        cancelButtonText="Cancel"
        onCancel={handleCancel}
        colorMode={colorMode}
        size="lg" // Increased size for better form layout
      >
        <Stack spacing={4}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* Date Input */}
              <FormControl id="date" isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </FormControl>
              {/* Lottery Category Select */}
              <FormControl id="lotteryCategoryName" isRequired>
                <FormLabel>Lottery Category Name</FormLabel>
                <Select
                  onChange={(event) =>
                    setLotteryCategoryName(event.target.value)
                  }
                  value={lotteryCategoryName}
                >
                  {lotteryCategories.map((category) => (
                    <option key={category._id} value={category.lotteryName}>
                      {category.lotteryName}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* Winning Numbers Inputs */}
              <FormControl id="winNumbers" isRequired>
                <FormLabel>Win Numbers</FormLabel>
                <Stack bg={"white"} p="5px">
                  <Flex
                    flexWrap="wrap"
                    flexDirection={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                  >
                    {/* BLT and L3C Fields */}
                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      {/* BLT1 - First */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          1st (First)
                        </FormLabel>
                        <Input
                          placeholder="First"
                          maxLength={2}
                          value={numbers[0].number}
                          onChange={(event) =>
                            handleNumberChange(0, event.target.value)
                          }
                        />
                      </Box>
                      {/* BLT2 - Second */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          2nd (Second)
                        </FormLabel>
                        <Input
                          placeholder="Second"
                          maxLength={2}
                          value={numbers[1].number}
                          onChange={(event) =>
                            handleNumberChange(1, event.target.value)
                          }
                        />
                      </Box>
                      {/* BLT3 - Third */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          3rd (Third)
                        </FormLabel>
                        <Input
                          placeholder="Third"
                          maxLength={2}
                          value={numbers[2].number}
                          onChange={(event) =>
                            handleNumberChange(2, event.target.value)
                          }
                        />
                      </Box>
                      {/* L3C */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L3C
                        </FormLabel>
                        <Input
                          placeholder="L3C"
                          maxLength={3}
                          value={numbers[3].number}
                          onChange={(event) =>
                            handleNumberChange(3, event.target.value)
                          }
                        />
                      </Box>
                    </VStack>

                    {/* MRG Fields */}
                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      {/* MRG1 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG1
                        </FormLabel>
                        <Input
                          placeholder="MRG1"
                          value={numbers[10].number}
                          onChange={(event) =>
                            handleNumberChange(10, event.target.value)
                          }
                        />
                      </Box>
                      {/* MRG2 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG2
                        </FormLabel>
                        <Input
                          placeholder="MRG2"
                          value={numbers[11].number}
                          onChange={(event) =>
                            handleNumberChange(11, event.target.value)
                          }
                        />
                      </Box>
                      {/* MRG3 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG3
                        </FormLabel>
                        <Input
                          placeholder="MRG3"
                          value={numbers[12].number}
                          onChange={(event) =>
                            handleNumberChange(12, event.target.value)
                          }
                        />
                      </Box>
                      {/* MRG4 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG4
                        </FormLabel>
                        <Input
                          placeholder="MRG4"
                          value={numbers[13].number}
                          onChange={(event) =>
                            handleNumberChange(13, event.target.value)
                          }
                        />
                      </Box>
                      {/* MRG5 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG5
                        </FormLabel>
                        <Input
                          placeholder="MRG5"
                          value={numbers[14].number}
                          onChange={(event) =>
                            handleNumberChange(14, event.target.value)
                          }
                        />
                      </Box>
                      {/* MRG6 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          MRG6
                        </FormLabel>
                        <Input
                          placeholder="MRG6"
                          value={numbers[15].number}
                          onChange={(event) =>
                            handleNumberChange(15, event.target.value)
                          }
                        />
                      </Box>
                    </VStack>

                    {/* L4C and L5C Fields */}
                    <VStack
                      flexBasis={{ base: "100%", md: "32%" }}
                      color="black"
                    >
                      {/* L4C1 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C1
                        </FormLabel>
                        <Input
                          placeholder="L4C1"
                          value={numbers[4].number}
                          onChange={(event) =>
                            handleNumberChange(4, event.target.value)
                          }
                        />
                      </Box>
                      {/* L4C2 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C2
                        </FormLabel>
                        <Input
                          placeholder="L4C2"
                          value={numbers[5].number}
                          onChange={(event) =>
                            handleNumberChange(5, event.target.value)
                          }
                        />
                      </Box>
                      {/* L4C3 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L4C3
                        </FormLabel>
                        <Input
                          placeholder="L4C3"
                          value={numbers[6].number}
                          onChange={(event) =>
                            handleNumberChange(6, event.target.value)
                          }
                        />
                      </Box>

                      {/* L5C1 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C1
                        </FormLabel>
                        <Input
                          placeholder="L5C1"
                          value={numbers[7].number}
                          onChange={(event) =>
                            handleNumberChange(7, event.target.value)
                          }
                        />
                      </Box>
                      {/* L5C2 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C2
                        </FormLabel>
                        <Input
                          placeholder="L5C2"
                          value={numbers[8].number}
                          onChange={(event) =>
                            handleNumberChange(8, event.target.value)
                          }
                        />
                      </Box>
                      {/* L5C3 */}
                      <Box>
                        <FormLabel fontSize={14} mb="0">
                          L5C3
                        </FormLabel>
                        <Input
                          placeholder="L5C3"
                          value={numbers[9].number}
                          onChange={(event) =>
                            handleNumberChange(9, event.target.value)
                          }
                        />
                      </Box>
                    </VStack>
                  </Flex>
                  {/* Recalculate Button */}
                  <Flex justifyContent={"center"} alignItems={"center"}>
                    <Button
                      mt={4}
                      onClick={recalculateDependentNumbers}
                      colorScheme="teal"
                      width={"50%"}
                    >
                      Reverse all
                    </Button>
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

export default WinningNumbersManagement;
