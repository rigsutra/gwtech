import { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
import { Loading } from "components/Loading/Loading.js";

import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const SaleDetails = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [saleDatails, setSaleDetails] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [gameCategoryDetail, setGameCategoryDetail] = useState([]);
  const [lotteryDetail, setLotteryDetail] = useState([]);
  const [gameNumberDetail, setGameNumberDetail] = useState([]);

  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [selectedLottery, setSelectedLottery] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [limit, setLimit] = useState("");
  const [tickets, setTickets] = useState(0);
  const [gameNumberSellAmountSum, setGameNumberSellAmountSum] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchSellDetails = async () => {
    try {
      setLoading(true);
      const responseAllNumber = await api().get(
        `/sbuadmin/getselldetails?seller=${selectedSellerId}&lotteryCategoryName=${lotteryCategoryName.trim()}&fromDate=${fromDate}`
      );
      setSaleDetails(responseAllNumber.data.data);

      const responseByGameCatetory = await api().get(
        `/sbuadmin/getselldetailsbygamecategory?seller=${selectedSellerId}&lotteryCategoryName=${lotteryCategoryName.trim()}&fromDate=${fromDate}`
      );
      setGameCategoryDetail(responseByGameCatetory.data.data);

      const responseAllLottery = await api().get(
        `/sbuadmin/getselldetailsallloterycategory?seller=${selectedSellerId}&fromDate=${fromDate}`
      );

      const responseData = responseAllLottery.data.data;
      setSumAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.sum,
          0
        )
      );
      setPaidAmount(
        Object.values(responseData).reduce(
          (acc, sellerData) => acc + sellerData.paid,
          0
        )
      );

      setLotteryDetail(responseData);
    } catch (error) {
      console.error("Error fetching sell details:", error);
      toast({
        title: "Error fetching Sell Details!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSellGameNumberDetails = async (
    lottoName,
    gameName,
    number,
    date,
    seller
  ) => {
    try {
      const response = await api().get(
        `/sbuadmin/getsellgamenumberinfo?seller=${seller}&lotteryCategoryName=${lottoName}&fromDate=${date}&gameCategory=${gameName}&gameNumber=${number}`
      );
      console.log("response", response);
      const res = response.data;
      setGameNumberDetail(res.data);

      setLimit(res.limitInfo);
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedNumber(number);
      setSelectedLottery(lottoName);
      setSelectedGame(gameName);
      setTickets(
        Object.values(res.data).reduce(
          (acc, sellerData) => acc + sellerData.ticketCount,
          0
        )
      );
      setGameNumberSellAmountSum(
        Object.values(res.data).reduce(
          (acc, sellerData) => acc + sellerData.sum,
          0
        )
      );
      onOpen();
    } catch (err) {
      console.error("Error fetching game info:", err);
      toast({
        title: "Error fetching Game info",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        setLotteryCategories(response.data.data);
        if (response.data.data.length > 0) {
          setLotteryCategoryName(response.data.data[0].lotteryName);
        }
      } catch (error) {
        console.error("Error fetching lottery categories:", error);
        toast({
          title: "Error fetching lottery categories",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchSeller = async () => {
      try {
        const response = await api().get("/subadmin/getseller");
        setSellerInfo(response.data.users);
      } catch (error) {
        console.error("Error fetching seller info:", error);
        toast({
          title: "Error fetching seller info",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchLotteryCategories();
    fetchSeller();
  }, []);

  useEffect(() => {
    // Automatically fetch sell details when sellerId, lotteryCategoryName, or fromDate changes
    if (selectedSellerId && lotteryCategoryName && fromDate) {
      fetchSellDetails();
    }
  }, [selectedSellerId, lotteryCategoryName, fromDate]);

  return (
    <Flex
      direction="column"
      pt={{ base: "120px", md: "75px" }}
      justifyContent="center"
      alignItems="center" // Add this to center children horizontally
      width="100%"
    >
      <Card
        overflowX="auto"
        p={{ base: "10px", md: "20px" }}
        width={{ base: "100%", md: "80%", lg: "70%" }} // Responsive width
        maxWidth="1200px"
        border={{ base: "none", md: "1px solid gray" }}
        borderRadius={"none"}
        boxShadow="lg"
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
            width="100%"
          >
            <Text fontSize="lg" color="black" fontWeight="bold" mb="10px">
              Sale Details
            </Text>
            <Flex
              color="black"
              flexWrap="wrap"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
              ml={10}
            >
              <FormControl
                id="lotteryCategoryName"
                width="320px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Seller</FormLabel>
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
              <FormControl
                id="lotteryCategoryName"
                width="350px"
                isRequired
                pl={10}
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Category Name</FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value)
                    }
                    defaultValue={
                      lotteryCategories.length > 0
                        ? lotteryCategories[0]?.lotteryName
                        : ""
                    }
                    width="200px"
                  >
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
              <FormControl id="fromDate" width="320px" isRequired py="5px">
                <HStack justifyContent="space-between">
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    width="200px"
                  />
                </HStack>
              </FormControl>
              <Button
                size="sm"
                ml={10}
                onClick={fetchSellDetails}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
              >
                <CgSearch size={20} color={"white"} />
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody pb="15px" pt="50px">
          {loading ? (
            <Loading />
          ) : (
            <HStack alignItems={"normal"}>
              <VStack width="55%" paddingRight="5px">
                <Table variant="striped">
                  <Thead>
                    <Tr>
                      <Th color="black">Game</Th>
                      <Th color="black">Number</Th>
                      <Th color="black">Amount</Th>
                      <Th color="black">Price</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {saleDatails.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <pre>{item._id.gameCategory}</pre>
                        </Td>
                        <Td>
                          <Button
                            className="tableInterBtn"
                            size="sm"
                            width="100%"
                            backgroundColor={"#edf2f7"}
                            onClick={() =>
                              fetchSellGameNumberDetails(
                                item._id.lotteryCategoryName,
                                item._id.gameCategory,
                                item._id.number,
                                item._id.date,
                                selectedSellerId
                              )
                            }
                          >
                            {item._id.number}
                          </Button>
                        </Td>
                        <Td>
                          <pre>{item.count}</pre>
                        </Td>
                        <Td>
                          <pre>{item.totalAmount}</pre>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <Thead>
                    <Th></Th>
                    <Th>Total</Th>
                    <Th>HTG</Th>
                    <Th>
                      {saleDatails.reduce(
                        (total, value) => total + value.totalAmount,
                        0
                      )}
                    </Th>
                  </Thead>
                </Table>
              </VStack>
              <VStack width="60%">
                <VStack width="100%" border={"1px solid gray"} padding={"10px"}>
                  <h4 style={{ marginBottom: "3px" }}>
                    {gameCategoryDetail[0]?._id?.lotteryCategoryName}
                  </h4>
                  {gameCategoryDetail?.map((item, index) => (
                    <Flex
                      width="70%"
                      justifyContent={"space-between"}
                      key={index}
                      mt="0px !important"
                    >
                      <h5>{item?._id?.gameCategory}</h5>
                      <h5>{item?.totalAmount}</h5>
                    </Flex>
                  ))}
                  <Flex
                    width="70%"
                    justifyContent={"space-between"}
                    color="red"
                    mt="0px !important"
                  >
                    <h5>Total</h5>
                    <h5>
                      {gameCategoryDetail?.reduce(
                        (acc, detail) => acc + detail.totalAmount,
                        0
                      )}
                    </h5>
                  </Flex>
                </VStack>
                <VStack marginTop="0px !important" width="100%">
                  <Table variant="striped">
                    <Thead>
                      <Tr>
                        <Th color="black">Lottery</Th>
                        <Th color="black">Total</Th>
                        <Th color="black">Paid</Th>
                        <Th color="black">Profit</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.values(lotteryDetail).map((data) => (
                        <Tr key={data.name}>
                          <Td>
                            <pre>{data.name}</pre>
                          </Td>
                          <Td>
                            <pre>{data.sum}</pre>
                          </Td>
                          <Td>
                            <pre>{data.paid}</pre>
                          </Td>
                          <Td>
                            <pre>{data.sum - data.paid}</pre>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Thead>
                      <Th>Total</Th>
                      <Th>{sumAmount}</Th>
                      <Th>{paidAmount}</Th>
                      <Th>{sumAmount - paidAmount}</Th>
                    </Thead>
                  </Table>
                </VStack>
              </VStack>
            </HStack>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={handleCancel} colorMode={colorMode}>
        <Stack spacing={2}>
          <Flex>
            <Table variant="striped">
              <Tbody>
                <Tr>
                  <Td>
                    <pre>{selectedGame}</pre>
                  </Td>
                  <Td>
                    <pre>{selectedNumber}</pre>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <pre>Date</pre>
                  </Td>
                  <Td>
                    <pre>{selectedDate}</pre>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <pre>Lottery</pre>
                  </Td>
                  <Td>
                    <pre>{selectedLottery}</pre>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
            <Table variant="striped">
              <Tbody>
                <Tr>
                  <Td>
                    <pre>Limit</pre>
                  </Td>
                  <Td>
                    <pre>{limit}</pre>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <pre>Pari</pre>
                  </Td>
                  <Td>
                    <pre>{gameNumberSellAmountSum}</pre>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <pre>Available</pre>
                  </Td>
                  <Td>
                    <pre>{limit - gameNumberSellAmountSum}</pre>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Flex>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Seller</Th>
                <Th>Company</Th>
                <Th>Tickets</Th>
                <Th>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.values(gameNumberDetail).map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <pre>{item.name}</pre>
                  </Td>
                  <Td>
                    <pre>{item.company}</pre>
                  </Td>
                  <Td>
                    <pre>{item.ticketCount}</pre>
                  </Td>
                  <Td>
                    <pre>{item.sum}</pre>
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Total</Th>
                <Th>{tickets}</Th>
                <Th>{gameNumberSellAmountSum}</Th>
              </Tr>
            </Thead>
          </Table>
        </Stack>
      </Modal>
    </Flex>
  );
};

export default SaleDetails;