import { useEffect, useState } from "react";
import { Flex, Box, Button, Grid, Text, Input, Heading } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import ModalComp from "./componentes/ModalComp";
import axios from "axios";

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState({});
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users");
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  };

  const handleGenerateLetter = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${id}/carta`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Carta_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar carta", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRemove = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`);
        setData(data.filter(user => user._id !== id));
      } catch (error) {
        console.error("Erro ao deletar usuário", error);
      }
    }
  };

  return (
    <Flex direction="column" align="center" bg="gray.100" minH="100vh">
      <Box bg="blue.500" w="100%" py={4} textAlign="center">
        <Heading color="white">MEMBRO CELESTIAL</Heading>
      </Box>
      <Box w="80%" my={6} p={4} bg="white" borderRadius="md" boxShadow="lg">
        <Flex justify="space-between" mb={4}>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => [setDataEdit({}), onOpen()]}>Criar novo Membro</Button>
          <Input placeholder="Pesquisar Membro" value={search} onChange={(e) => setSearch(e.target.value)} width="300px" />
        </Flex>

        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {data.filter(user => user.nome.toLowerCase().includes(search.toLowerCase())).map(({ _id, nome }, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
              <Text fontWeight="bold" fontSize="lg">{nome}</Text>
              <Flex mt={3} justify="space-between">
                <Button size="sm" leftIcon={<EditIcon />} colorScheme="yellow" onClick={() => [setDataEdit(data.find(user => user._id === _id)), onOpen()]}>Editar</Button>
                <Button size="sm" leftIcon={<DeleteIcon />} colorScheme="red" onClick={() => handleRemove(_id)}>Excluir</Button>
                <Button size="sm" colorScheme="green" onClick={() => handleGenerateLetter(_id)}>Gerar Carta</Button>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Modal para edição ou criação */}
      <ModalComp isOpen={isOpen} onClose={onClose} dataEdit={dataEdit} loadUsers={loadUsers} />
    </Flex>
  );
};

export default App;
