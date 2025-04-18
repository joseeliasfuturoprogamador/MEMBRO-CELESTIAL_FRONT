import { useState } from "react";
import { Box, VStack, Text, IconButton, Stack, Link, Drawer, DrawerOverlay, DrawerContent, DrawerBody } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { MdCalendarToday } from "react-icons/md";
import { FaDollarSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path); // Navega para a página correspondente
    toggleSidebar(); // Fecha o sidebar móvel
  };

  return (
    <>
      {/* Botão de menu para telas pequenas */}
      <IconButton
        aria-label="Abrir menu"
        icon={<HamburgerIcon />}
        colorScheme="black"
        variant="outline"
        size="lg"
        display={{ base: "block", md: "none" }}
        position="fixed"
        top={4}
        left={4}
        zIndex={10}
        onClick={toggleSidebar}
      />

      {/* Sidebar padrão para telas maiores */}
      <Box
        w="200px"
        bg="blue.500"
        color="white"
        minH="100vh"
        p={5}
        boxShadow="md"
        position="fixed"
        display={{ base: "none", md: "block" }}
      >
        <VStack spacing={8} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Dashboard
          </Text>
          <Stack spacing={4}>
            <Link
              display="flex"
              alignItems="center"
              _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
              p={2}
              borderRadius="md"
              onClick={() => handleNavigation("/membros")} // Navega para a página de membros
            >
              <HamburgerIcon boxSize={5} mr={3} />
              <Text>Membros</Text>
            </Link>
            <Link
              display="flex"
              alignItems="center"
              _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
              p={2}
              borderRadius="md"
              onClick={() => handleNavigation("/dizimos")} // Navega para a página de dízimos
            >
              <FaDollarSign size={20} style={{ marginRight: "10px" }} />
              <Text>Dízimos</Text>
            </Link>
            <Link
              display="flex"
              alignItems="center"
              _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
              p={2}
              borderRadius="md"
              onClick={() => handleNavigation("/eventos")} // Navega para a página de eventos
            >
              <MdCalendarToday size={20} style={{ marginRight: "10px" }} />
              <Text>Eventos</Text>
            </Link>
          </Stack>
        </VStack>
      </Box>

      {/* Sidebar móvel */}
      <Drawer placement="left" onClose={toggleSidebar} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody bg="blue.500" color="white" p={5}>
            <VStack spacing={8} align="stretch">
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Dashboard
              </Text>
              <Stack spacing={4}>
                <Link
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
                  p={2}
                  borderRadius="md"
                  onClick={() => handleNavigation("/membros")} // Navega para a página de membros
                >
                  <HamburgerIcon boxSize={5} mr={3} />
                  <Text>Membros</Text>
                </Link>
                <Link
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
                  p={2}
                  borderRadius="md"
                  onClick={() => handleNavigation("/dizimos")} // Navega para a página de dízimos
                >
                  <FaDollarSign size={20} style={{ marginRight: "10px" }} />
                  <Text>Dízimos</Text>
                </Link>
                <Link
                  display="flex"
                  alignItems="center"
                  _hover={{ bg: "blue.900", p: 2, borderRadius: "md" }}
                  p={2}
                  borderRadius="md"
                  onClick={() => handleNavigation("/eventos")} // Navega para a página de eventos
                >
                  <MdCalendarToday size={20} style={{ marginRight: "10px" }} />
                  <Text>Eventos</Text>
                </Link>
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
