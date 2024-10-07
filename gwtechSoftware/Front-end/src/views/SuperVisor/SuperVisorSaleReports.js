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
  FormControl,
  FormLabel,
  Input,
  HStack,
  Select,
  Text,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { CgSearch } from "react-icons/cg";

// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import { Loading } from "components/Loading/Loading.js";

const SaleReports = () => {
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [saleReports, setSaleReports] = useState([]);
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidAmount, setPaidAmount] = useState(0);
  const [sumAmount, setSumAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLotteryCategories = async () => {
      try {
        const response = await api().get("/admin/getlotterycategory");
        if (response.data && response.data.success) {
          setLotteryCategories(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error fetching lottery categories:",
          error.response ? error.response.data : error
        );
        toast({
          title: "Error fetching lottery categories",
          description: error.response
            ? error.response.data.message
            : "Network error. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const fetchSeller = async () => {
      try {
        const response = await api().get("/superVisor/getseller");
        if (response.data && response.data.users) {
          setSellerInfo(response.data.users);
        }
      } catch (error) {
        toast({
          title: "Error fetching seller info",
          description: error.response
            ? error.response.data.message
            : "Network error. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchLotteryCategories();
    fetchSeller();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api().get(
        `/superVisor/getsalereports?seller=${selectedSellerId}&fromDate=${fromDate}&toDate=${toDate}&lotteryCategoryName=${lotteryCategoryName.trim()}`
      );

      const responseData = response.data.data || [];
      const saleReportsWithCompany = responseData.map((sellerData) => {
        const seller = sellerInfo.find(
          (info) => info.userName === sellerData.name
        );
        return {
          ...sellerData,
          companyName: seller ? seller.companyName : "N/A", // Add companyName if found, else "N/A"
        };
      });
      setSaleReports(saleReportsWithCompany);

      setSumAmount(
        saleReportsWithCompany.reduce(
          (acc, sellerData) => acc + (sellerData.sum || 0),
          0
        )
      );
      setPaidAmount(
        saleReportsWithCompany.reduce(
          (acc, sellerData) => acc + (sellerData.paid || 0),
          0
        )
      );
    } catch (error) {
      console.error("Error fetching sale reports:", error);
      toast({
        title: "Error fetching sale reports",
        description: error.response
          ? error.response.data.message
          : "Network error. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
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
            alignItems="center"
            width="100%"
          >
            <Text fontSize="lg" fontWeight="bold" mb="10px">
              Sale Reports
            </Text>
            <Flex
              flexWrap="wrap"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="flex-start"
              width="100%"
              alignItems="center"
            >
              <FormControl id="seller" width="320px" isRequired py="5px">
                <HStack justifyContent="space-between">
                  <FormLabel>Seller</FormLabel>
                  <Select
                    onChange={(event) =>
                      setSelectedSellerId(event.target.value)
                    }
                    width="200px"
                    value={selectedSellerId}
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
                width="320px"
                isRequired
                py="5px"
              >
                <HStack justifyContent="space-between">
                  <FormLabel>Category Name</FormLabel>
                  <Select
                    onChange={(event) =>
                      setLotteryCategoryName(event.target.value)
                    }
                    width="200px"
                    value={lotteryCategoryName}
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

              <FormControl id="fromDate" width="320px" isRequired py="5px">
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

              <FormControl id="toDate" width="320px" isRequired py="5px">
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

              <Button
                size="sm"
                onClick={fetchReports}
                bg={colorMode === "light" ? "red.600" : "blue.300"}
                _hover={{
                  bg: colorMode === "light" ? "red.500" : "blue.200",
                }}
                mx="10px"
              >
                <CgSearch size={20} color={"white"} />
              </Button>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody pb="15px">
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>Seller Name</Th>
                <Th>Company</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Profit</Th>
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
              <>
                <Tbody>
                  {Object.values(saleReports).map((sellerData) => (
                    <Tr key={sellerData.name}>
                      <Td>{sellerData.name}</Td>
                      <Td>{sellerData.companyName}</Td>
                      <Td>{sellerData.sum || 0}</Td>
                      <Td>{sellerData.paid || 0}</Td>
                      <Td>{(sellerData.sum || 0) - (sellerData.paid || 0)}</Td>
                    </Tr>
                  ))}
                </Tbody>

                <Thead>
                  <Tr>
                    <Th>Total ({saleReports.length})</Th>
                    <Th></Th>
                    <Th>{sumAmount}</Th>
                    <Th>{paidAmount}</Th>
                    <Th>{sumAmount - paidAmount}</Th>
                  </Tr>
                </Thead>
              </>
            )}
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default SaleReports;
