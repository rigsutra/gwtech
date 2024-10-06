import { useState, useEffect, Fragment } from "react";
import api from "../../utils/customFetch.js";

import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Checkbox,
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
import { RiDeleteBinLine } from "react-icons/ri";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";
import { Loading } from "components/Loading/Loading.js";

const SoldTickets = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [soldTickets, setSoldTickets] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [companyName, setCompanyName] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [toDate, setToDate] = useState(new Date().toLocaleDateString("en-CA"));

  const [gameNumbers, setGameNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

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

    const fetchSeller = async () => {
      try {
        const response = await api().get("/subadmin/getseller");
        const sellersWithCompany = response.data.users.map((seller) => ({
          ...seller,
          companyName: response.data.companyName, // add company name to each seller
        }));
        setSellerInfo(sellersWithCompany);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching seller info",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchSeller();
  }, []);

  const fetchSoldTickets = async () => {
    try {
      setLoading(true);
      const response = await api().get(
        `/subadmin/gettickets?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );
      setSoldTickets(response.data.data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching sold tickets",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    try {
      const result = confirm("Do you want really delete this ticket?");
      if (result) {
        const res = await api().delete(`/subadmin/deleteticket/${id}`);
        if (res.data.success) {
          setSoldTickets(soldTickets.filter((ticket) => ticket._id !== id));
          toast({
            title: "Ticket deleted",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: res.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting Ticket",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGetTicketNumbers = async (numbers) => {
    try {
      setGameNumbers(numbers);
      onOpen();
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const formatDate = (dateString) => {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }
    // Return the original string if it doesn't match the expected format
    return dateString;
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
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={"center"}
            width="100%"
          >
            <Text fontSize="lg" color="black" font="Weight:bold" mb="10px">
              Sold Tickets
            </Text>
            <Flex
              color="black"
              flexWrap="wrap"
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
            >
              <FormControl id="lotteryCategoryName" width="330px" isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel m="0" p="10px">
                    Seller
                  </FormLabel>
                  <Select
                    onChange={(event) =>
                      setSelectedSellerId(event.target.value)
                    }
                    width="200px"
                  >
                    <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                      All
                    </option>
                    {sellerInfo.map((info) => (
                      <option
                        key={info._id}
                        value={info._id}
                        style={{ backgroundColor: "#e3e2e2" }}
                      >
                        {info.userName}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              <FormControl id="lotteryCategoryName" width="330px" isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel p="10px" m="0">
                    Category Name
                  </FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value.trim())
                    }
                    width="200px"
                  >
                    <option value={""} style={{ backgroundColor: "#e3e2e2" }}>
                      All Category
                    </option>
                    {lotteryCategories.map((category) => (
                      <option
                        key={category._id}
                        value={category.lotteryName}
                        style={{ backgroundColor: "#e3e2e2" }}
                      >
                        {category.lotteryName}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              <FormControl id="fromDate" width="330px" isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel p="10px" m="0">
                    From
                  </FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>
              <FormControl id="toDate" width="330px" isRequired>
                <HStack justifyContent="space-between" py="5px">
                  <FormLabel p="10px" m="0">
                    To
                  </FormLabel>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>

              <Button
                size="sm"
                onClick={fetchSoldTickets}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
                mx={"10px"}
              >
                <CgSearch size={20} color={"white"} />
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody pb="15px">
          <Flex
            flexWrap="wrap"
            flexDirection={{ base: "column", sm: "row" }}
            justifyContent="flex-start"
            width="100%"
          >
            <Stack
              spacing={1}
              borderRadius="3px"
              m="5px"
              boxShadow="0px 0px 2px white"
              width="100%"
            >
              <VStack spacing={3} align="stretch">
                <Table variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Ticket ID</Th>
                      <Th>Ticket Price</Th>
                      <Th>Date</Th>
                      <Th>Lottery</Th>
                      <Th>Seller</Th>
                      <Th>Seller Company</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  {loading ? (
                    <Tbody>
                      <Tr>
                        <Td colSpan={5}>
                          <Loading />
                        </Td>
                      </Tr>
                    </Tbody>
                  ) : (
                    <Tbody>
                      {soldTickets.map((item) => {
                        return (
                          <Tr key={item._id}>
                            <Td>
                              <Button
                                className="tableInterBtn"
                                size="sm"
                                width="100%"
                                backgroundColor={"#edf2f7"}
                                onClick={() =>
                                  handleGetTicketNumbers(item.numbers)
                                }
                              >
                                {item.ticketId}
                              </Button>
                            </Td>
                            <Td>
                              <pre>{item.ticketPrice}</pre>
                            </Td>
                            <Td>
                              <pre>{formatDate(item.date.substr(0, 10))}</pre>
                            </Td>
                            <Td>
                              <pre>{item.lotteryCategoryName}</pre>
                            </Td>
                            <Td>
                              <pre>
                                {
                                  sellerInfo.find(
                                    (sitem) => sitem._id === item.seller
                                  )?.userName
                                }
                              </pre>
                            </Td>
                            <Td>
                              <pre>
                                {
                                  sellerInfo.find(
                                    (sitem) => sitem._id === item.seller
                                  )?.companyName
                                }
                              </pre>
                            </Td>
                            <Td>
                              <Button
                                className="tableInterBtn"
                                size="sm"
                                onClick={() => deleteTicket(item._id)}
                                bg={
                                  colorMode === "light" ? "red.600" : "blue.300"
                                }
                                _hover={{
                                  bg:
                                    colorMode === "light"
                                      ? "red.300"
                                      : "blue.200",
                                }}
                              >
                                <RiDeleteBinLine size={14} color="white" />
                              </Button>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  )}
                </Table>
              </VStack>
            </Stack>
          </Flex>
        </CardBody>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        colorMode={colorMode}
        title={"Game Numbers"}
        submitButtonText={"Ok"}
        onSubmit={handleCancel}
      >
        <Stack pt="20px">
          <Table variant="striped" color="black">
            <Thead>
              <Tr>
                <Th color="black">Game Name</Th>
                <Th color="black" p="3px">
                  Number
                </Th>
                <Th color="black" p="3px">
                  Amount
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {gameNumbers.map((items) => {
                return items.bonus ? (
                  <Tr key={items._id}>
                    <Td color="brown">
                      <pre>{items.gameCategory}(Bonus)</pre>
                    </Td>
                    <Td color="brown">
                      <pre>{items.number}</pre>
                    </Td>
                    <Td color="brown">
                      <pre>{items.amount}</pre>
                    </Td>
                  </Tr>
                ) : (
                  <Tr key={items._id}>
                    <Td>
                      <pre>{items.gameCategory}</pre>
                    </Td>
                    <Td>
                      <pre>{items.number}</pre>
                    </Td>
                    <Td>
                      <pre>{items.amount}</pre>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
            <Thead>
              <Tr>
                <Th color="#f00" p="3px">
                  Total
                </Th>
                <Th color="#f00" p="3px">
                  HTG
                </Th>
                <Th color="#f00" p="3px">
                  {gameNumbers.reduce(
                    (total, value) =>
                      !value.bonus ? total + value.amount : total,
                    0
                  )}
                </Th>
              </Tr>
            </Thead>
          </Table>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default SoldTickets;
