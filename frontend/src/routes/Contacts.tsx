import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Flex,
} from "@chakra-ui/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { api } from "../hooks/api"

interface Contact {
  id: string
  organisation: string
  description: string | null
  owner_id: string
}

interface ContactsResponse {
  data: Contact[]
  count: number
}

export default function Contacts() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ organisation: "", description: "" })

  const { data, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.get<ContactsResponse>("/contacts"),
  })

  const createMutation = useMutation({
    mutationFn: (data: { organisation: string; description: string }) =>
      api.post("/contacts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      setIsCreating(false)
      setFormData({ organisation: "", description: "" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { organisation: string; description: string } }) =>
      api.put(`/contacts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      setEditingId(null)
      setFormData({ organisation: "", description: "" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })

  const handleCreate = () => {
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    }
  }

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id)
    setFormData({
      organisation: contact.organisation,
      description: contact.description || "",
    })
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ organisation: "", description: "" })
  }

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center">
        <Heading size="lg">Contacts</Heading>
        {!isCreating && !editingId && (
          <Button colorScheme="blue" onClick={() => setIsCreating(true)}>
            Add Contact
          </Button>
        )}
      </Flex>

      {(isCreating || editingId) && (
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Stack gap={4}>
            <Heading size="md">{editingId ? "Edit Contact" : "New Contact"}</Heading>
            <Box>
              <Text mb={2} fontWeight="medium">Organisation</Text>
              <Input
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                placeholder="Company name"
              />
            </Box>
            <Box>
              <Text mb={2} fontWeight="medium">Description</Text>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </Box>
            <Flex gap={2}>
              <Button
                colorScheme="blue"
                onClick={editingId ? handleUpdate : handleCreate}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </Flex>
          </Stack>
        </Box>
      )}

      <Stack gap={4}>
        {data?.data.map((contact) => (
          <Box key={contact.id} bg="white" p={6} borderRadius="lg" shadow="sm">
            <Flex justify="space-between" align="start">
              <Box>
                <Heading size="sm">{contact.organisation}</Heading>
                {contact.description && (
                  <Text color="gray.600" mt={1}>{contact.description}</Text>
                )}
              </Box>
              <Flex gap={2}>
                <Button size="sm" variant="outline" onClick={() => startEdit(contact)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(contact.id)}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Flex>
            </Flex>
          </Box>
        ))}

        {data?.data.length === 0 && (
          <Text color="gray.500" textAlign="center" py={8}>
            No contacts yet. Add your first contact!
          </Text>
        )}
      </Stack>
    </Stack>
  )
}
