import React, { useState, useEffect } from "react";
import api from "../../utils/customFetch.js";
import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast,
  HStack,
  Select,
  VStack,
  Box,
} from "@chakra-ui/react";
import { FaPlus, FaEdit, FaMinus } from "react-icons/fa";
import { CgSearch } from "react-icons/cg";
import { RiDeleteBinLine } from "react-icons/ri";

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Modal from "components/Modal/Modal.js";

const LimitNumber = () => {
  const [editing, setEditing] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(null);
  const [limitNumbers, setLimitNumbers] = useState([]);
  const [lotteryCategories, setLotteryCategories] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [lotteryCategoryName, setLotteryCategoryName] = useState("");
  const [blt, setBlt] = useState("");
  const [l3c, setL3c] = useState("");
  const [mrg, setMrg] = useState("");
  const [l4c1, setL4c1] = useState("");
  const [l4c2, setL4c2] = useState("");
  const [l4c3, setL4c3] = useState("");
  const [l5c1, setL5c1] = useState("");
  const [l5c2, setL5c2] = useState("");
  const [l5c3, setL5c3] = useState("");
  const [activeView, setActiveView] = useState("all");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoryResponse = await api().get("/admin/getlotterycategory");
        setLotteryCategories(categoryResponse?.data?.data);

        const supervisorResponse = await api().get("/subadmin/getsuperVisor");

        setSupervisors(supervisorResponse?.data);

        const sellerResponse = await api().get(
          "/subadmin/getsellerWhoNotHaveSupervisor"
        );
        console.log(sellerResponse);
        setSellers(sellerResponse?.data?.users);
      } catch (error) {
        toast({
          title: "Error fetching initial data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchInitialData();
  }, [toast]);

  const handleGetLimit = async (viewType) => {
    setActiveView(viewType);
    console.log(viewType);
    try {
      let endpoint;
      if (viewType === "all") endpoint = "/subadmin/getLimitButAll";
      else if (viewType === "supervisor")
        endpoint = "/subadmin/getLimitButSuperVisor";
      else if (viewType === "seller") endpoint = "/subadmin/getLimitButSeller";

      const response = await api().get(endpoint);
      console.log(response);
      setLimitNumbers(response?.data);
    } catch (error) {
      toast({
        title: `Error fetching limits for ${viewType}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const limits = [
      { gameCategory: "BLT", limitsButs: blt },
      { gameCategory: "L3C", limitsButs: l3c },
      { gameCategory: "MRG", limitsButs: mrg },
      { gameCategory: "L4C 1", limitsButs: l4c1 },
      { gameCategory: "L4C 2", limitsButs: l4c2 },
      { gameCategory: "L4C 3", limitsButs: l4c3 },
      { gameCategory: "L5C 1", limitsButs: l5c1 },
      { gameCategory: "L5C 2", limitsButs: l5c2 },
      { gameCategory: "L5C 3", limitsButs: l5c3 },
    ];
    const data = {
      lotteryCategoryName,
      limits,
      seller: activeView === "seller" ? selectedSeller : undefined,
      superVisor: activeView === "supervisor" ? selectedSupervisor : undefined,
    };

    try {
      const response = editing
        ? await api().patch(
            `/subadmin/updatelimitbut/${currentLimit?._id}`,
            data
          )
        : await api().post("/subadmin/addlimitbut", data);

      if (editing) {
        setLimitNumbers((prev) =>
          prev.map((limit) =>
            limit._id === currentLimit?._id ? response?.data : limit
          )
        );
      } else {
        setLimitNumbers((prev) => [...prev, response?.data]);
      }

      onClose();
      toast({
        title: `Limit ${editing ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: `Error ${editing ? "updating" : "creating"} limit`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (limit) => {
    setEditing(true);
    setCurrentLimit(limit);
    setLotteryCategoryName(limit.lotteryCategoryName);
    setSelectedSeller(limit.seller?._id || "");
    setSelectedSupervisor(limit.superVisor?._id || "");
    setBlt(limit.limits[0]?.limitsButs || "");
    setL3c(limit.limits[1]?.limitsButs || "");
    setMrg(limit.limits[2]?.limitsButs || "");
    setL4c1(limit.limits[3]?.limitsButs || "");
    setL4c2(limit.limits[4]?.limitsButs || "");
    setL4c3(limit.limits[5]?.limitsButs || "");
    setL5c1(limit.limits[6]?.limitsButs || "");
    setL5c2(limit.limits[7]?.limitsButs || "");
    setL5c3(limit.limits[8]?.limitsButs || "");
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await api().delete(`/subadmin/deletelimitbut/${id}`);
      setLimitNumbers((prev) => prev.filter((limit) => limit?._id !== id));
      toast({
        title: "Limit deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting limit",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            Limit Numbers
          </Text>
          <HStack marginX={40} paddingX={20}>
            <Button
              size="sm"
              bg="blue.100"
              onClick={() => handleGetLimit("all")}
            >
              <CgSearch size="20px" color="white" /> All
            </Button>
            <Button
              size="sm"
              bg="blue.400"
              onClick={() => handleGetLimit("supervisor")}
              marginX={5}
            >
              <CgSearch size="20px" color="white" /> Supervisor
            </Button>
            <Button
              size="sm"
              bg="blue.800"
              onClick={() => handleGetLimit("seller")}
            >
              <CgSearch size="20px" color="white" /> Seller
            </Button>
          </HStack>
          <Button
            size="sm"
            onClick={() => {
              setEditing(false);
              onOpen();
            }}
            marginX={30}
            bg="green.800"
          >
            <FaPlus size={24} color="white" />
          </Button>
        </CardHeader>

        <CardBody>
          <Flex flexWrap="wrap">
            {limitNumbers?.map((limit) => (
              <Stack
                key={limit._id}
                width="350px"
                p="10px"
                m="10px"
                border="1px solid gray"
              >
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <FormLabel>
                      {limit.seller?.userName ||
                        limit.superVisor?.userName ||
                        "All"}
                    </FormLabel>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(limit)}
                        bg="yellow.800"
                      >
                        <FaEdit color="white" />
                      </Button>
                      <Button
                        size="sm"
                        bg="red.800"
                        onClick={() => handleDelete(limit._id)}
                      >
                        <RiDeleteBinLine color="white" />
                      </Button>
                    </HStack>
                  </HStack>
                  <FormLabel>{limit.lotteryCategoryName}</FormLabel>

                  {/* Display left (4) and right (5) columns for limit values */}
                  <Flex justify="space-between" width="100%">
                    {/* Left column with first 4 items */}
                    <VStack spacing={1} align="start" flex="1">
                      {limit.limits.slice(0, 4).map((limitItem, index) => (
                        <Box key={index} display="flex" alignItems="center">
                          <FormLabel fontSize="sm" width="50px" m={0}>
                            {limitItem.gameCategory}
                          </FormLabel>
                          <Input
                            type="number"
                            value={limitItem.limitsButs}
                            isReadOnly
                            size="sm"
                            width="100px"
                          />
                        </Box>
                      ))}
                    </VStack>

                    {/* Right column with remaining 5 items */}
                    <VStack spacing={1} align="start" flex="1">
                      {limit.limits.slice(4).map((limitItem, index) => (
                        <Box key={index} display="flex" alignItems="center">
                          <FormLabel fontSize="sm" width="50px" m={0}>
                            {limitItem.gameCategory}
                          </FormLabel>
                          <Input
                            type="number"
                            value={limitItem.limitsButs}
                            isReadOnly
                            size="sm"
                            width="100px"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </Flex>
                </VStack>
              </Stack>
            ))}
          </Flex>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Lottery Category Name</FormLabel>
            <Select
              value={lotteryCategoryName}
              onChange={(e) => setLotteryCategoryName(e.target.value)}
            >
              {lotteryCategories?.map((category) => (
                <option key={category._id} value={category.lotteryName}>
                  {category.lotteryName}
                </option>
              ))}
            </Select>
          </FormControl>

          {activeView === "supervisor" && (
            <FormControl>
              <FormLabel>Supervisor</FormLabel>
              <Select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
              >
                <option value="">Select Supervisor</option>
                {supervisors?.map((supervisor) => (
                  <option key={supervisor._id} value={supervisor._id}>
                    {supervisor.userName}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          {activeView === "seller" && (
            <FormControl>
              <FormLabel>Seller</FormLabel>
              <Select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
              >
                <option value="">Select Seller</option>
                {sellers?.map((seller) => (
                  <option key={seller._id} value={seller._id}>
                    {seller.userName}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl>
            <FormLabel> Set Limit </FormLabel>
            <Stack p="5px">
              <Flex justifyContent="space-between">
                <VStack
                  mx="3px"
                  flexBasis={{ base: "100%", md: "50%" }}
                  color="black"
                >
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      BLT
                    </FormLabel>
                    <Input
                      type="number"
                      value={blt}
                      onChange={(e) => setBlt(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L3C
                    </FormLabel>
                    <Input
                      placeholder="L3C"
                      value={l3c}
                      onChange={(event) => setL3c(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      MRG
                    </FormLabel>
                    <Input
                      placeholder="MRG"
                      value={mrg}
                      onChange={(event) => setMrg(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L4C1
                    </FormLabel>
                    <Input
                      placeholder="L4C1"
                      value={l4c1}
                      onChange={(event) => setL4c1(event.target.value)}
                      type="number"
                    />
                  </Box>
                </VStack>
                <VStack>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L4C2
                    </FormLabel>
                    <Input
                      placeholder="L4C2"
                      value={l4c2}
                      onChange={(event) => setL4c2(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L4C3
                    </FormLabel>
                    <Input
                      placeholder="L4C3"
                      value={l4c3}
                      onChange={(event) => setL4c3(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L5C1
                    </FormLabel>
                    <Input
                      placeholder="L5C1"
                      value={l5c1}
                      onChange={(event) => setL5c1(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L5C2
                    </FormLabel>
                    <Input
                      placeholder="L5C2"
                      value={l5c2}
                      onChange={(event) => setL5c2(event.target.value)}
                      type="number"
                    />
                  </Box>
                  <Box>
                    <FormLabel fontSize={14} mb="0" mx="2px">
                      L5C3
                    </FormLabel>
                    <Input
                      placeholder="L5C3"
                      value={l5c3}
                      onChange={(event) => setL5c3(event.target.value)}
                      type="number"
                    />
                  </Box>
                </VStack>
              </Flex>
            </Stack>
          </FormControl>
          {/* Add similar form fields for L3C, MRG, L4C1, etc. */}
          <Button type="submit">{editing ? "Update" : "Add"} Limit</Button>
        </form>
      </Modal>
    </Flex>
  );
};

export default LimitNumber;
