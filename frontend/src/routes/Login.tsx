import { Box, Button, Container, Heading, Input, Stack, Text, Link as ChakraLink } from "@chakra-ui/react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/contacts")
    } catch {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="md" py={16}>
      <Box bg="white" p={8} borderRadius="lg" shadow="md">
        <Stack gap={6}>
          <Heading size="lg" textAlign="center">Login</Heading>

          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Email</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@example.com"
                  required
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </Box>

              {error && (
                <Text color="red.500" fontSize="sm">{error}</Text>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                loading={isLoading}
                width="full"
              >
                Login
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Don't have an account?{" "}
            <ChakraLink asChild color="blue.500">
              <Link to="/signup">Sign up</Link>
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}
